import { HardhatRuntimeEnvironment } from 'hardhat/types';

import { AaveManipulator, AaveManipulator__factory } from '../../typechain';
import {
  ReplaceERC20ApproveSpenderManipulator,
  ReplaceERC20ApproveSpenderManipulator__factory,
} from '../../typechain';
import {
  CheckERC20ApproveSpenderManipulator,
  CheckERC20ApproveSpenderManipulator__factory,
} from '../../typechain';

export async function deployManipulators(
  hardhatEnv: HardhatRuntimeEnvironment,
): Promise<{
  erc20ApproveSpendersWhitelistManipulator: CheckERC20ApproveSpenderManipulator;
  erc20ApproveReplaceSenderManipulator: ReplaceERC20ApproveSpenderManipulator;
  aaveManipulator: AaveManipulator;
}> {
  const { ethers } = hardhatEnv;

  const erc20ApproveSpendersWhitelistManipulator = await (<
    CheckERC20ApproveSpenderManipulator__factory
  >await ethers.getContractFactory(
    'CheckERC20ApproveSpenderManipulator',
  )).deploy();
  const erc20ApproveReplaceSenderManipulator = await (<
    ReplaceERC20ApproveSpenderManipulator__factory
  >await ethers.getContractFactory(
    'ReplaceERC20ApproveSpenderManipulator',
  )).deploy();
  const aaveManipulator = await (<AaveManipulator__factory>(
    await ethers.getContractFactory('AaveManipulator')
  )).deploy();

  return {
    erc20ApproveReplaceSenderManipulator,
    erc20ApproveSpendersWhitelistManipulator,
    aaveManipulator,
  };
}
