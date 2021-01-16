//@ts-ignore
import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { formatEther, parseEther } from 'ethers/utils';
import { AddressZero } from 'ethers/constants';

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

import { parseCopyTraderCreationFromFactory } from './utils/logs-parsers';
import { CopyTraderPoolChargeStruct } from './utils/types';

describe('TradersFactory: test', function () {
  let accounts: Signer[];

  let factory: TradersFactory;
  let tradingStrategy: TradingStrategy;
  let copyTrader: CopyTrader;

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
      const followedTrader = await accounts[1].getAddress();

      const deploymentTx = await factory
        .connect(accounts[0])
        .createNew(followedTrader, tradingStrategy.address);

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
      { asset: AddressZero, value: operationsPoolCharge.toHexString() },
      { asset: AddressZero, value: relayPoolCharge.toHexString() },
    ];
    const poolsToBeCharged = [1, 0];

    const contractBalanceBeforeCharge = await accounts[0].provider.getBalance(
      copyTrader.address,
    );

    const tx = await copyTrader.chargePools(chargesToBeDone, poolsToBeCharged, {
      value: relayPoolCharge.add(operationsPoolCharge).toHexString(),
    });

    const receipt = await tx.wait();

    const contractBalanceAfterCharge = await accounts[0].provider.getBalance(
      copyTrader.address,
    );

    assert.equal(
      contractBalanceBeforeCharge
        .add(relayPoolCharge.toHexString())
        .add(operationsPoolCharge.toHexString())
        .toHexString(),
      contractBalanceAfterCharge.toHexString(),
    );

    const relayPool = await copyTrader.poolSize(0, AddressZero);
    const operationsPool = await copyTrader.poolSize(1, AddressZero);

    // Relay pool has 3 ethers in
    assert.equal(relayPool.toHexString(), relayPoolCharge.toHexString());

    // Operations pool has 3 ethers in
    assert.equal(
      operationsPool.toHexString(),
      operationsPoolCharge.toHexString(),
    );
  });
});
