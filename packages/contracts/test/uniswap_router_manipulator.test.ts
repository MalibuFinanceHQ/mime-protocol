import { ethers } from 'hardhat';
import { Signer, utils } from 'ethers';

import {
  UniswapRouterV2Manipulator__factory,
  UniswapRouterV2Manipulator,
} from '../typechain';

describe('UniswapV2 router ABI manipulators: test', () => {
  let accounts: Signer[];
  let manipulator: UniswapRouterV2Manipulator;
  let firstSigner: Signer;

  before(async () => {
    accounts = await ethers.getSigners();

    manipulator = await (<UniswapRouterV2Manipulator__factory>(
      await ethers.getContractFactory('UniswapRouterV2Manipulator')
    )).deploy();

    firstSigner = accounts[0];
  });

  it('Should make an ABI manipulation for UniswapV2 router: swapExactTokensForTokens', async () => {
    const dataToManipulate =
      '0x38ed173900000000000000000000000000000000000000000000001b1ae4d6e2ef500000000000000000000000000000000000000000000000000003631953ba7893e41900000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000f37fd9185bb5657d7e57ddea268fe56c2458f675000000000000000000000000000000000000000000000000000000005fea29a700000000000000000000000000000000000000000000000000000000000000030000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f';

    const call = await manipulator.manipulate(
      dataToManipulate,
      await firstSigner.getAddress(),
    );
    console.log(call);
  });
});
