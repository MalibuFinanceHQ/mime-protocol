import { ethers } from 'hardhat';
import { Signer } from 'ethers';

import { before } from 'mocha';
import { step } from 'mocha-steps';

describe('Copy token approval transaction: test', function () {
  let accounts: Signer[];

  before(async () => {
    accounts = await ethers.getSigners();

    // TODO Deploy traders factory
    // TODO deploy test ERC20
  });

  step('Should deploy an ABI manipulator', async () => {});
  step('Should deploy a strategy and bind manipulator to it', async () => {});
  step('Should deploy a copy trader', async () => {});
  step('Should relay tx copy, basing on valid signature', async () => {});
});
