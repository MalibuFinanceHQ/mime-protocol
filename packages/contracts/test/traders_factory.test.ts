//@ts-ignore
import { ethers } from 'hardhat';
import { Signer, constants, Wallet } from 'ethers';
import {
  parseEther,
  parseUnits,
  serializeTransaction,
  resolveProperties,
  keccak256,
  arrayify,
  SigningKey,
  parseTransaction,
} from 'ethers/lib/utils';

import { createIdentity } from 'eth-crypto';

import { step } from 'mocha-steps';
import { assert } from 'chai';

import {
  CopyTrader,
  CopyTrader__factory,
  TradersFactory,
  TradersFactory__factory,
  TradingStrategy,
  TradingStrategy__factory,
} from '../typechain';

import {
  parseCopyTraderCreationFromFactory,
  parseCopyTraderChargedEvents,
} from './utils/logs-parsers';
import { CopyTraderPoolChargeStruct, CopyTraderPool } from './utils/types';

describe('TradersFactory: test', function () {
  let accounts: Signer[];

  let factory: TradersFactory;
  let tradingStrategy: TradingStrategy;
  let copyTrader: CopyTrader;

  const followed = createIdentity();

  this.beforeAll(async () => {
    accounts = await ethers.getSigners();

    tradingStrategy = await (<TradingStrategy__factory>(
      await ethers.getContractFactory('TradingStrategy')
    )).deploy();
    factory = await (<TradersFactory__factory>(
      await ethers.getContractFactory('TradersFactory')
    )).deploy();
  });

  step(
    'Should deploy a new copy trader and check if owner is correct',
    async () => {
      const deploymentTx = await factory
        .connect(accounts[0])
        .createNew(followed.address, tradingStrategy.address);

      const receipt = await deploymentTx.wait();
      const traderCreationEvent = parseCopyTraderCreationFromFactory(
        <any>receipt,
      );

      copyTrader = CopyTrader__factory.connect(
        traderCreationEvent.onContract,
        accounts[0],
      );

      const ownerAddress = await copyTrader.owner();

      assert.equal(
        ownerAddress.toLocaleLowerCase(),
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
      const tx = {
        to: constants.AddressZero,
        value: 0,
        gasLimit: 21000,
        gasPrice: parseUnits('21', 'gwei').toHexString(),
        nonce: await accounts[0].provider?.getTransactionCount(
          followed.address,
        ),
      };

      const rsTx = await resolveProperties(tx);

      const rlpEncodedTx = serializeTransaction(<any>rsTx);

      const msgHash = keccak256(rlpEncodedTx);
      const msgHashBytes = arrayify(msgHash);

      const signature = new SigningKey(followed.privateKey).signDigest(
        msgHashBytes,
      );

      const parsedWalletSignedTx = parseTransaction(
        arrayify(await new Wallet(followed.privateKey).signTransaction(tx)),
      );

      // Assert signature is properly generated
      assert.equal(parsedWalletSignedTx.v, signature.v);
      assert.equal(parsedWalletSignedTx.r, signature.r);
      assert.equal(parsedWalletSignedTx.s, signature.s);

      const [
        isValid,
        onChainComputedTxHash,
      ] = await copyTrader.isRLPSignatureCorrect(
        rlpEncodedTx,
        signature.v,
        signature.r,
        signature.s,
      );

      assert.isTrue(isValid);
      assert.equal(onChainComputedTxHash, msgHash);
    },
  );
});
