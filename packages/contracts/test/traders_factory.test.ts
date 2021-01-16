//@ts-ignore
import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { SigningKey, parseEther } from 'ethers/utils';
import { AddressZero } from 'ethers/constants';

import { step } from 'mocha-steps';
import { assert } from 'chai';

import {
  CopyTrader,
  TradersFactory,
  TradersFactory__factory,
  TradingStrategy,
  TradingStrategy__factory,
} from '../typechain';

import { parseCopyTraderCreationFromFactory } from './utils/logs-parsers';

describe('TradersFactory: test', function () {
  let accounts: Signer[];

  let factory: TradersFactory;
  let tradingStrategy: TradingStrategy;

  this.beforeAll(async () => {
    accounts = await ethers.getSigners();

    tradingStrategy = await (<TradingStrategy__factory>(
      await ethers.getContractFactory('TradingStrategy')
    )).deploy();
    factory = await (<TradersFactory__factory>(
      await ethers.getContractFactory('TradersFactory')
    )).deploy();

    factory.connect(accounts[0]);
  });

  step('Deploy new wallet', async () => {
    const followedTrader = await accounts[1].getAddress();

    const ethInRelayPool = parseEther('5');
    const ethInOperationsPool = parseEther('5');

    const deploymentTx = await factory.createNew(
      followedTrader,
      tradingStrategy.address,
      [{ asset: AddressZero, value: ethInRelayPool.toHexString() }],
      [{ asset: AddressZero, value: ethInOperationsPool.toHexString() }],
      {
        value: ethInOperationsPool.add(ethInRelayPool).toHexString(),
      },
    );

    const receipt = await deploymentTx.wait();
    const traderCreationEvent = parseCopyTraderCreationFromFactory(
      <any>receipt,
    );

    const balanceOfTraderFollowingContract = await accounts[0].provider.getBalance(
      traderCreationEvent.onContract,
    );

    assert.equal(
      balanceOfTraderFollowingContract.toHexString(),
      ethInRelayPool.add(ethInOperationsPool).toHexString(),
    );
  });
});
