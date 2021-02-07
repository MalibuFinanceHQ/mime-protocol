import { ethers } from 'hardhat';
import {
  Signer,
  constants,
  Wallet,
  BigNumber,
  UnsignedTransaction,
} from 'ethers';
import {
  parseEther,
  parseUnits,
  serializeTransaction,
  resolveProperties,
  keccak256,
  arrayify,
  parseTransaction,
} from 'ethers/lib/utils';

import { createIdentity } from 'eth-crypto';

import { step } from 'mocha-steps';
import { assert } from 'chai';
import { before } from 'mocha';

import {
  CopyTrader,
  CopyTrader__factory,
  TradersFactory,
  TradersFactory__factory,
  TradingStrategy,
  TradingStrategy__factory,
  PricesLib,
  PricesLib__factory,
} from '../typechain';

import {
  parseCopyTraderCreationFromFactory,
  parseCopyTraderChargedEvents,
} from './utils/logs-parsers';
import { CopyTraderPoolChargeStruct, CopyTraderPool } from './utils/types';
import { getTxV } from './utils/get-tx-v';

describe('TradersFactory: test', function () {
  let accounts: Signer[];

  let factory: TradersFactory;
  let tradingStrategy: TradingStrategy;
  let copyTrader: CopyTrader;
  let pricesLib: PricesLib;

  const followed = createIdentity();

  before(async () => {
    accounts = await ethers.getSigners();

    tradingStrategy = await (<TradingStrategy__factory>(
      await ethers.getContractFactory('TradingStrategy')
    )).deploy();

    pricesLib = await (<PricesLib__factory>(
      await ethers.getContractFactory('PricesLib')
    )).deploy();

    const copyTraderBytecodeOnchainInstance = await (<CopyTrader__factory>(
      await ethers.getContractFactory('CopyTrader', {
        libraries: {
          PricesLib: pricesLib.address,
        },
      })
    )).deploy();

    factory = await (<TradersFactory__factory>(
      await ethers.getContractFactory('TradersFactory')
    )).deploy(copyTraderBytecodeOnchainInstance.address);

    console.log('factory addr', factory.address);
  });

  step(
    'Should deploy a new copy trader and check if owner is correct',
    async () => {
      const deploymentTx = await factory
        .connect(accounts[0])
        .createNew(followed.address, 0, tradingStrategy.address);

      const receipt = await deploymentTx.wait();
      const traderCreationEvent = parseCopyTraderCreationFromFactory(
        <any>receipt,
      );

      copyTrader = CopyTrader__factory.connect(
        traderCreationEvent.onContract,
        accounts[0],
      );

      const managerAddress = await copyTrader.manager();

      assert.equal(
        managerAddress.toLocaleLowerCase(),
        (await accounts[0].getAddress()).toLocaleLowerCase(),
      );
    },
  );

  step('Should charge with eth the copy trader pools', async () => {
    const relayPoolCharge = parseEther('3');
    const operationsPoolCharge = parseEther('5');

    const chargesToBeDone: CopyTraderPoolChargeStruct[] = [
      {
        asset: constants.AddressZero,
        value: operationsPoolCharge.toHexString(),
      },
      { asset: constants.AddressZero, value: relayPoolCharge.toHexString() },
    ];
    const poolsToBeCharged = [CopyTraderPool.OPERATIONS, CopyTraderPool.RELAY];
    // @ts-ignore
    const contractBalanceBeforeCharge = await accounts[0].provider.getBalance(
      copyTrader.address,
    );

    const tx = await copyTrader.chargePools(chargesToBeDone, poolsToBeCharged, {
      value: relayPoolCharge.add(operationsPoolCharge).toHexString(),
    });

    const receipt = await tx.wait();
    const poolChargedEmittedEvents = parseCopyTraderChargedEvents(<any>receipt);

    // Assert 2 events have been emitted
    assert.equal(poolChargedEmittedEvents.length, poolsToBeCharged.length);

    const contractBalanceAfterCharge = await accounts[0].provider?.getBalance(
      copyTrader.address,
    );

    assert.equal(
      contractBalanceBeforeCharge
        .add(relayPoolCharge.toHexString())
        .add(operationsPoolCharge.toHexString())
        .toHexString(),
      contractBalanceAfterCharge?.toHexString(),
    );

    const relayPool = await copyTrader.poolSize(
      CopyTraderPool.RELAY,
      constants.AddressZero,
    );
    const operationsPool = await copyTrader.poolSize(
      CopyTraderPool.OPERATIONS,
      constants.AddressZero,
    );

    // Relay pool has 3 ethers in
    assert.equal(relayPool.toHexString(), relayPoolCharge.toHexString());

    // Operations pool has 3 ethers in
    assert.equal(
      operationsPool.toHexString(),
      operationsPoolCharge.toHexString(),
    );
  });

  step(
    'Should check if the signature correctly created and is able to be recovered onchain',
    async () => {
      const tx: UnsignedTransaction = {
        to: constants.AddressZero,
        value: BigNumber.from(0),
        gasLimit: BigNumber.from(21000),
        gasPrice: parseUnits('21', 'gwei'),
        nonce: await accounts[0].provider?.getTransactionCount(
          followed.address,
        ),
        chainId: await accounts[0].getChainId(),
        data: '0x',
      };
      const txResolved = await resolveProperties(tx);
      const rlpEncodedTx = serializeTransaction(txResolved);

      const msgHash = keccak256(rlpEncodedTx);

      const wallet = new Wallet(followed.privateKey);
      const signedRawWalletTx = await wallet.signTransaction(tx);
      const parsedWalletSignedTx = parseTransaction(
        arrayify(signedRawWalletTx),
      );

      const finalV = getTxV(parsedWalletSignedTx);

      const [
        isValid,
        onChainComputedTxHash,
      ] = await copyTrader.isRLPSignatureCorrect(
        rlpEncodedTx,
        finalV,
        parsedWalletSignedTx.r!,
        parsedWalletSignedTx.s!,
      );

      assert.isTrue(isValid);
      assert.equal(onChainComputedTxHash, msgHash);
    },
  );
});
