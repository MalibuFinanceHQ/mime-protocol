import { ethers } from 'hardhat';
import { constants, Signer, utils } from 'ethers';

import { step } from 'mocha-steps';
import { assert } from 'chai';
import { before } from 'mocha';

import {
  AaveManipulator,
  CheckERC20ApproveSpenderManipulator,
  CopyTrader,
  CopyTrader__factory,
  ReplaceERC20ApproveSpenderManipulator,
} from '../typechain';
import { PricesLib, PricesLib__factory } from '../typechain';
import { TradingStrategy, TradingStrategy__factory } from '../typechain';
import { TradersFactory, TradersFactory__factory } from '../typechain';
import { MockDAI, MockLendingPool } from '../typechain';
import { deployMocks } from './utils/deploy-mocks';
import { deployManipulators } from './utils/deploy-manipulators';
import { parseCopyTraderCreationFromFactory } from './utils/logs-parsers';

import { getTxV } from './utils/get-tx-v';
import { serializeContractTx } from './utils/serialize-contract-transaction';
import { arrayify, formatEther } from 'ethers/lib/utils';

describe('Relay Transaction: test', function () {
  let accounts: Signer[];

  let factory: TradersFactory;
  let tradingStrategy: TradingStrategy;
  let copyTrader: CopyTrader;
  let pricesLib: PricesLib;

  // Mocks.
  let mockDAI: MockDAI;
  let mockLendingPool: MockLendingPool;

  // Actors.
  let deployer: Signer;
  let followedTrader: Signer;
  let followingTrader: Signer;

  // Manipulators
  let aaveDepositManipulator: AaveManipulator;
  let erc20ApproveReplaceSenderManipulator: ReplaceERC20ApproveSpenderManipulator;
  let erc20ApproveSpendersWhitelist: CheckERC20ApproveSpenderManipulator;

  const { MaxUint256, AddressZero } = constants;
  const { parseEther, recoverAddress } = utils;

  before(async () => {
    // Get accounts
    accounts = await ethers.getSigners();

    // Define actors.
    deployer = accounts[0];
    followedTrader = accounts[1];
    followingTrader = accounts[2];

    // Deploy prices library.
    pricesLib = await (<PricesLib__factory>(
      await ethers.getContractFactory('PricesLib')
    )).deploy();

    // Deploy CopyTrader EIP1967 proxy.
    const proxy = await (<CopyTrader__factory>await ethers.getContractFactory(
      'CopyTrader',
      {
        libraries: {
          PricesLib: pricesLib.address,
        },
      },
    )).deploy();

    // Deploy copy traders factory.
    factory = await (<TradersFactory__factory>(
      await ethers.getContractFactory('TradersFactory')
    )).deploy(proxy.address);

    // Deploy mocks.
    const mocks = await deployMocks({ ethers } as any);
    mockDAI = mocks.mockDAI;
    mockLendingPool = mocks.mockLendingPool;

    // Deploy AbiManipulators and link to strategy.
    const manipulators = await deployManipulators({ ethers } as any);
    aaveDepositManipulator = manipulators.aaveManipulator;
    erc20ApproveReplaceSenderManipulator =
      manipulators.erc20ApproveReplaceSenderManipulator;
    erc20ApproveSpendersWhitelist =
      manipulators.erc20ApproveSpendersWhitelistManipulator;

    // Add aave mock to whitelist.
    await erc20ApproveSpendersWhitelist.whitelist(mockLendingPool.address);
  });

  step('Should deploy and setup a strategy', async () => {
    // Deploy strategy.
    tradingStrategy = await (<TradingStrategy__factory>(
      await ethers.getContractFactory('TradingStrategy')
    )).deploy();

    // Setup ERC20 approve manipulator.
    const approveMethodSig = utils.arrayify('0x095ea7b3');
    await tradingStrategy.setManipulator(
      mockDAI.address,
      approveMethodSig,
      erc20ApproveSpendersWhitelist.address,
    );

    // Setup AAVE deposit manipulator.
    const depositMethodSig = utils.arrayify('0xe8eda9df');
    await tradingStrategy.setManipulator(
      mockLendingPool.address,
      depositMethodSig,
      aaveDepositManipulator.address,
    );
  });

  step('Should deploy new copy trader and attach setup strategy', async () => {
    const deploymentTx = await factory
      .connect(followingTrader)
      .createNew(await followedTrader.getAddress(), 0, tradingStrategy.address);

    const receipt = await deploymentTx.wait();
    const traderCreationEvent = parseCopyTraderCreationFromFactory(
      <any>receipt,
    );

    copyTrader = CopyTrader__factory.connect(
      traderCreationEvent.onContract,
      followingTrader,
    );
  });

  step('Should add funds to relay pool', async () => {
    await copyTrader.chargePools(
      [{ asset: AddressZero, value: parseEther('2').toHexString() }],
      [0],
      { value: parseEther('2').toHexString() },
    );
  });

  step(
    'Should relay an erc20 approve tx signed by followed trader',
    async () => {
      const approveTx = await mockDAI
        .connect(followedTrader)
        .approve(mockLendingPool.address, MaxUint256.toHexString());

      console.log('expected address', await followedTrader.getAddress());

      const originalV = approveTx.v!;

      console.log('Relayed txhash: ', approveTx.hash);
      const hash = approveTx.hash;

      const { serialized, v, r, s } = serializeContractTx(approveTx);

      const recovered = recoverAddress(arrayify(hash), { v, r, s });
      console.log('Ethers recovered address: ', recovered);

      console.log('Relaying ...');

      await copyTrader
        .connect(deployer)
        .relay(AddressZero, serialized, v, r, s);
    },
  );
});
