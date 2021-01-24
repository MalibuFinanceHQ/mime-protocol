import { ethers } from 'hardhat';
import { Signer } from 'ethers';
// import { AbiCoder } from 'ethers/lib/utils';
import { constants } from 'ethers';


import { before } from 'mocha';
import { assert } from 'chai';

import {
    ERC20IncreaseAllowanceReplaceSpenderABIManipulator,
    ERC20IncreaseAllowanceReplaceSpenderABIManipulator__factory,
    ERC20IncreaseAllowanceSpenderCheckABIManipulator,
    ERC20IncreaseAllowanceSpenderCheckABIManipulator__factory


} from '../typechain';

const { MaxUint256 } = constants;

describe('ERC20 ABI manipulators: test', () => {
    let accounts: Signer[];
    let approvalsWithReplacementManipulator: ERC20IncreaseAllowanceReplaceSpenderABIManipulator;
    let approvalsWhitelistManipulator: ERC20IncreaseAllowanceSpenderCheckABIManipulator;

    //@ts-ignore
    before(async () => {
        accounts = await ethers.getSigners();

        approvalsWithReplacementManipulator = await (<ERC20IncreaseAllowanceReplaceSpenderABIManipulator__factory>(
            await ethers.getContractFactory('ERC20IncreaseAllowanceReplaceSpenderABIManipulator')
        )).deploy();

        approvalsWhitelistManipulator = await (<ERC20IncreaseAllowanceSpenderCheckABIManipulator__factory>(
            await ethers.getContractFactory('ERC20IncreaseAllowanceSpenderCheckABIManipulator')
        )).deploy();
    });

    it("Should manipulate the abi by replacing spender correctly", async () => {
        const replaceWithAddress = await accounts[0].getAddress();
        const abiToManipulate = '0x095ea7b300000000000000000000000095e6f48254609a6ee006f7d493c8e5fb97094cefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

        const manipulated = await approvalsWithReplacementManipulator.manipulate(abiToManipulate, replaceWithAddress);

        assert.equal(
            manipulated.length, 138
        );

        const decodedIdentifier = manipulated.slice(0, 10);
        assert.equal(
            decodedIdentifier, "0x095ea7b3"
        );
        const decodedAddress = `0x${(manipulated.slice(10, 74)).slice(24)}`;
        assert.equal(decodedAddress.toLocaleLowerCase(), replaceWithAddress.toLocaleLowerCase());

        const decodedValue = manipulated.slice(74, manipulated.length);
        assert.isTrue(
            MaxUint256.eq(`0x${decodedValue}`)
        );
    });

    it("Should check if abi is returned when address in whitelist", async () => {
        const whitelistedSpender = '0x95E6F48254609A6ee006F7D493c8e5fB97094ceF';
        await approvalsWhitelistManipulator.whitelist(whitelistedSpender);

        const abi = '0x095ea7b300000000000000000000000095e6f48254609a6ee006f7d493c8e5fb97094cefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

        const abiReturned = await approvalsWhitelistManipulator.manipulate(abi, whitelistedSpender);

    });
});