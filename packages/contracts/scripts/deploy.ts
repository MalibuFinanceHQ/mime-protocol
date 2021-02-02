import { ethers } from 'hardhat';

import {
  CopyTrader__factory,
  TradersFactory__factory,
  AaveManipulator__factory,
  CheckERC20ApproveSpenderManipulator__factory,
  ReplaceERC20ApproveSpenderManipulator__factory,
  TradingStrategy__factory,
  PricesLib__factory,
} from '../typechain';

async function main() {
  let nonce = await (await ethers.getSigners())[0].getTransactionCount();
  // Deploy libs.
  console.log('Deploying PricesLib ...');
  const PricesLib = (await ethers.getContractFactory(
    'PricesLib',
  )) as PricesLib__factory;
  const pricesLib = await PricesLib.deploy({ nonce });
  nonce++;
  console.log('PricesLib deployed: ', pricesLib.address);

  // Deploy copy Traders proxy
  console.log('Deploying CopyTrader proxy ...');
  const CopyTrader = (await ethers.getContractFactory('CopyTrader', {
    libraries: {
      PricesLib: pricesLib.address,
    },
  })) as CopyTrader__factory;
  const copyTradersProxy = await CopyTrader.deploy({ nonce });
  nonce++;
  console.log('CopyTrader proxy deployed: ', copyTradersProxy.address);

  // Deploy Factory.
  console.log('Deploying TradersFactory ...');
  const TradersFactory = (await ethers.getContractFactory(
    'TradersFactory',
  )) as TradersFactory__factory;
  const tradersFactory = await TradersFactory.deploy(copyTradersProxy.address, {
    nonce,
  });
  nonce++;
  console.log('TradersFactory deployed: ', tradersFactory.address);

  // Deploy ABI manipulators.
  console.log('Deploying Aave Manipulator ...');
  const AaveManipulator = (await ethers.getContractFactory(
    'AaveManipulator',
  )) as AaveManipulator__factory;
  const aaveManipulator = await AaveManipulator.deploy({ nonce });
  nonce++;
  console.log('Aave Manipulator deployed: ', aaveManipulator.address);

  console.log('Deploying CheckErc20Approve Manipulator ...');
  const CheckErc20ApproveManipulator = (await ethers.getContractFactory(
    'CheckERC20ApproveSpenderManipulator',
  )) as CheckERC20ApproveSpenderManipulator__factory;
  const checkErc20ApproveManipulator = await CheckErc20ApproveManipulator.deploy(
    { nonce },
  );
  nonce++;
  console.log(
    'Deployed CheckErc20Approve Manipulator: ',
    checkErc20ApproveManipulator.address,
  );

  console.log('Deploying ReplaceErc20ApproveSpender Manipulator ...');
  const ReplaceErc20ApproveSpenderManipulator = (await ethers.getContractFactory(
    'ReplaceERC20ApproveSpenderManipulator',
  )) as ReplaceERC20ApproveSpenderManipulator__factory;
  const replaceErc20ApproveSpenderManipulator = await ReplaceErc20ApproveSpenderManipulator.deploy(
    { nonce },
  );
  nonce++;
  console.log(
    'ReplaceErc20ApproveSpender Manipulator deployed: ',
    replaceErc20ApproveSpenderManipulator.address,
  );

  // Deploy strategy.
  console.log('Deploying Trading Strategy ...');
  const TradingStrategy = (await ethers.getContractFactory(
    'TradingStrategy',
  )) as TradingStrategy__factory;
  const tradingStrategy = await TradingStrategy.deploy({ nonce });
  console.log('Deployed Trading Strategy: ', tradingStrategy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
