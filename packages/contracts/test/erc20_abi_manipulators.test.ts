import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { AbiCoder } from 'ethers/utils'
import { MaxUint256 } from 'ethers/constants'


import { before } from 'mocha'
import { assert } from 'chai'

import { ERC20IncreaseAllowanceABIManipulator, ERC20IncreaseAllowanceABIManipulator__factory } from '../typechain';

describe('ERC20 ABI manipulators: test', () => {
    let accounts: Signer[];
    let approvalsManipulator: ERC20IncreaseAllowanceABIManipulator;

    //@ts-ignore
    before(async () => {
        accounts = await ethers.getSigners();

        approvalsManipulator = await (<ERC20IncreaseAllowanceABIManipulator__factory>(
            await ethers.getContractFactory('ERC20IncreaseAllowanceABIManipulator')
        )).deploy();
    })

    it("Should manipulate the abi correctly", async () => {
        const replaceWithAddress = await accounts[0].getAddress()
        const abiToManipulate = '0x095ea7b300000000000000000000000095e6f48254609a6ee006f7d493c8e5fb97094cefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

        const manipulated = await approvalsManipulator.manipulate(abiToManipulate, replaceWithAddress)

        assert.equal(
            manipulated.length, 138
        )

        const decodedIdentifier = manipulated.slice(0, 10);
        assert.equal(
            decodedIdentifier, "0x095ea7b3"
        )
        const decodedAddress = `0x${(manipulated.slice(10, 74)).slice(24)}`
        assert.equal(decodedAddress.toLocaleLowerCase(), replaceWithAddress.toLocaleLowerCase())

        const decodedValue = manipulated.slice(74, manipulated.length)
        assert.isTrue(
            MaxUint256.eq(`0x${decodedValue}`)
        )
    })
})