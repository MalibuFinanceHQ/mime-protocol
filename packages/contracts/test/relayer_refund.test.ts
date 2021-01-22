import { ethers } from 'hardhat';
import {
  Signer,
  BigNumber,
} from 'ethers';
import { expect } from 'chai';
import {
  CopyTrader,
  CopyTrader__factory,
  TradingStrategy,
  TradingStrategy__factory,
} from '../typechain';
import { step } from 'mocha-steps';

describe('RelayerRefunds: test', () => {
  let accounts: Signer[];
  let copyTrader: CopyTrader;
  let tradingStrategy: TradingStrategy;

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    tradingStrategy = await (<TradingStrategy__factory>(
      await ethers.getContractFactory('TradingStrategy')
    )).deploy();

    // Follow next account
    const followingAddr = await accounts[1].getAddress();

    copyTrader = await (<CopyTrader__factory>(
      await ethers.getContractFactory('CopyTrader')
    )).deploy(followingAddr, tradingStrategy.address);
  });

  step('Should set the feesPaymentsAsset variable and fetch last price', async () => {
    const uniswapDAIWETHPair = "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11";
    await copyTrader.setFeesPaymentsAsset(uniswapDAIWETHPair);

    expect(await copyTrader.feesPaymentsAsset()).to.equal(uniswapDAIWETHPair);

    const lastPrice = await copyTrader.fetchLastPrice();
    console.log(`Last price: ${lastPrice.toString()} DAI`);
    expect(lastPrice).to.not.be.null;
  });
});
