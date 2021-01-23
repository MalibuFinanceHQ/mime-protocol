import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { parseEther, formatEther } from 'ethers/lib/utils';
import { expect } from 'chai';
import {
  CopyTrader,
  CopyTrader__factory,
  TradersFactory__factory,
  TradingStrategy,
  TradingStrategy__factory,
} from '../typechain';
import { step } from 'mocha-steps';
import { parseCopyTraderCreationFromFactory } from './utils/logs-parsers';

describe('RelayerRefunds: test', () => {
  let accounts: Signer[];
  let copyTrader: CopyTrader;
  let tradingStrategy: TradingStrategy;

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    tradingStrategy = await (<TradingStrategy__factory>(
      await ethers.getContractFactory('TradingStrategy')
    )).deploy();

    // copy trader contract bytecode instance.
    const copyTraderBytecodeOnchainInstance = await (<CopyTrader__factory>(
      await ethers.getContractFactory('CopyTrader')
    )).deploy();

    const factory = await (<TradersFactory__factory>(
      await ethers.getContractFactory('TradersFactory')
    )).deploy(copyTraderBytecodeOnchainInstance.address);

    // Follow next account
    const followingAddr = await accounts[1].getAddress();

    const deploymentTx = await factory
      .connect(accounts[0])
      .createNew(followingAddr, tradingStrategy.address);

    const receipt = await deploymentTx.wait();
    const traderCreationEvent = parseCopyTraderCreationFromFactory(
      <any>receipt,
    );

    CopyTrader__factory.connect(traderCreationEvent.onContract, accounts[0]);

    copyTrader = CopyTrader__factory.connect(
      traderCreationEvent.onContract,
      accounts[0],
    );
  });

  step(
    'Should set the feesPaymentsAsset variable and get required token amount from wei',
    async () => {
      const TRB_CONTRACT = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5';
      await copyTrader.setFeesPaymentsAsset(TRB_CONTRACT);
      expect(await copyTrader.feesPaymentsAsset()).to.equal(TRB_CONTRACT);

      const weiAmount = parseEther("0.5");
      const tokenAmount = await copyTrader.tokenAmountFromWei(TRB_CONTRACT, weiAmount);
      console.log(`Token amount: ${formatEther(tokenAmount)} Ξ`);
      expect(tokenAmount).to.not.be.null;
    },
  );
});
