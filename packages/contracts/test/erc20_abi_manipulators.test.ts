import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { constants } from 'ethers';

import { before } from 'mocha';
import { assert } from 'chai';

import {
  ReplaceERC20ApproveSpenderManipulator,
  ReplaceERC20ApproveSpenderManipulator__factory,
  CheckERC20ApproveSpenderManipulator,
  CheckERC20ApproveSpenderManipulator__factory,
} from '../typechain';

const { MaxUint256 } = constants;

describe('ERC20 ABI manipulators: test', () => {
  let accounts: Signer[];
  let approvalsWithReplacementManipulator: ReplaceERC20ApproveSpenderManipulator;
  let approvalsWhitelistManipulator: CheckERC20ApproveSpenderManipulator;

  before(async () => {
    accounts = await ethers.getSigners();

    approvalsWithReplacementManipulator = await (<
      ReplaceERC20ApproveSpenderManipulator__factory
      >await ethers.getContractFactory(
        'ReplaceERC20ApproveSpenderManipulator',
      )).deploy();

    approvalsWhitelistManipulator = await (<
      CheckERC20ApproveSpenderManipulator__factory
      >await ethers.getContractFactory(
        'CheckERC20ApproveSpenderManipulator',
      )).deploy();
  });

  it('Should manipulate the abi by replacing spender correctly', async () => {
    const replaceWithAddress = await accounts[0].getAddress();
    const abiToManipulate =
      '0x095ea7b300000000000000000000000095e6f48254609a6ee006f7d493c8e5fb97094cefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    const manipulated = await approvalsWithReplacementManipulator.manipulate(
      abiToManipulate,
      replaceWithAddress,
    );

    assert.equal(manipulated.length, 138);

    const decodedIdentifier = manipulated.slice(0, 10);
    assert.equal(decodedIdentifier, '0x095ea7b3'); // bytes4(keccak256("approve(address,uint256)")
    const decodedAddress = `0x${manipulated.slice(10, 74).slice(24)}`;
    assert.equal(
      decodedAddress.toLocaleLowerCase(),
      replaceWithAddress.toLocaleLowerCase(),
    );

    const decodedValue = manipulated.slice(74, manipulated.length);
    assert.isTrue(MaxUint256.eq(`0x${decodedValue}`));
  });

  it('Should check if abi is returned when address is whitelisted', async () => {
    const whitelistedSpender = '0x95E6F48254609A6ee006F7D493c8e5fB97094ceF';
    await approvalsWhitelistManipulator.whitelist(whitelistedSpender);

    const abi =
      '0x095ea7b300000000000000000000000095e6f48254609a6ee006f7d493c8e5fb97094cefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    const abiReturned = await approvalsWhitelistManipulator.manipulate(
      abi,
      whitelistedSpender,
    );
  });
});
