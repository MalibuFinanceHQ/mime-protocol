import { HardhatRuntimeEnvironment } from "hardhat/types";

import { MockDAI, MockDAI__factory, MockLendingPool, MockLendingPool__factory } from '../../typechain';
import { constants } from 'ethers'

export async function deployMocks(hardhatEnv: HardhatRuntimeEnvironment): Promise<{
    mockDAI: MockDAI,
    mockLendingPool: MockLendingPool
}> {
    const { ethers } = hardhatEnv;

    const mockDAI = await (<MockDAI__factory>(await ethers.getContractFactory('MockDAI'))).deploy("Dai stablecoin", 'DAI', constants.MaxUint256.toHexString());
    const mockLendingPool = await (<MockLendingPool__factory>(await ethers.getContractFactory('MockLendingPool'))).deploy();
    return {
        mockDAI,
        mockLendingPool
    }
}