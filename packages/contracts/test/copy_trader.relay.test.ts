//@ts-ignore
import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { SigningKey } from 'ethers/utils';
import { AddressZero } from 'ethers/constants';

import {
  CopyTrader,
  CopyTrader__factory,
  TradingStrategy,
  TradingStrategy__factory,
} from '../typechain';

import { step } from 'mocha-steps';

describe('CopyTrader:relay flow test', function () {
  let accounts: Signer[];

  let copyTrader: CopyTrader;
  let tradingStrategy: TradingStrategy;

  this.beforeAll(async () => {
    accounts = await ethers.getSigners();

    tradingStrategy = await (<TradingStrategy__factory>(
      await ethers.getContractFactory('TradingStrategy')
    )).deploy();
    copyTrader = await (<CopyTrader__factory>(
      await ethers.getContractFactory('CopyTrader')
    )).deploy(
      await accounts[1].getAddress(),
      tradingStrategy.address,
      [],
      [],
      [AddressZero],
    );
  });

  step('Debug relay method', async () => {
    const someAbiData =
      '0x095ea7b3000000000000000000000000111111125434b319222cdbf8c261674adb56f3aeffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const validMethodId = '0x095ea7b3';
    const tx = await copyTrader.relay(
      await accounts[1].getAddress(),
      someAbiData,
    );

    tx.data;
    console.log(tx.hash);
    const { v, r, s } = tx;
    console.log(v, r, s);
  });
});
