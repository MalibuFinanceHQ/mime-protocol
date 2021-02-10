import { ethers } from 'hardhat';
import { Signer, constants } from 'ethers';

import { legos } from '@studydefi/money-legos';

import { expect } from 'chai';

import {
  UniswapRouterV2Manipulator__factory,
  UniswapRouterV2Manipulator,
  MockUniswapV2Router__factory,
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
    const encodedTx = await MockUniswapV2Router__factory.connect(
      constants.AddressZero,
      firstSigner,
    ).populateTransaction.swapExactTokensForTokens(
      constants.MaxUint256,
      0,
      [
        legos.erc20.dai.address,
        legos.erc20.wbtc.address,
        legos.erc20.usdc.address,
      ],
      await accounts[2].getAddress(),
      constants.MaxUint256,
      { gasLimit: '67893883', gasPrice: '98783', nonce: 873 },
    );
    const data = encodedTx.data;

    const manipulated = await manipulator.manipulate(
      data!,
      await firstSigner.getAddress(),
    );

    expect(manipulated.length).to.be.equal(data?.length);
  });
});
