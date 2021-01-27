import { ethers } from 'hardhat';
import { Signer, Contract, BigNumber } from 'ethers';
import { parseEther, formatEther } from 'ethers/lib/utils';
import {
  AaveManipulator,
  AaveManipulator__factory,
} from '../typechain';
import LendingPoolABI from './abi/LendingPool.json';
import ERC20ABI from './abi/ERC20.json';

describe('Aave ABI manipulators: test', () => {
  let accounts: Signer[];
  let aaveManipulator: AaveManipulator;
  let lendingPool: Contract;
  let ERC20Asset: Contract;
  const DAI_ADDR = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  let firstSigner: Signer;

  before(async () => {
    accounts = await ethers.getSigners();

    aaveManipulator = await (<
      AaveManipulator__factory
      >await ethers.getContractFactory(
        'AaveManipulator',
      )).deploy();

    firstSigner = accounts[0];
    ERC20Asset = new Contract(DAI_ADDR, ERC20ABI, firstSigner);
    // const lendingPoolProxy = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";
    const lendingPoolImpl = "0xC6845a5C768BF8D7681249f8927877Efda425baf";
    lendingPool = new Contract(lendingPoolImpl, LendingPoolABI, firstSigner);
  });

  it('Should make a deposit on Aave', async () => {
    const amount = parseEther("1.0");
    const onBehalfOf = firstSigner.getAddress();
    const referralCode = 0;
    const balance = await firstSigner.getBalance();
    console.log(formatEther(BigNumber.from(balance).toString()));
    await ERC20Asset.approve(lendingPool.address, amount);
    await lendingPool.deposit(DAI_ADDR, amount, referralCode);

    // const methodID = '0xe8eda9df'; // bytes4(keccak256("deposit(address,uint256,address,uint16)"))
    // const ABI = 'e4c536c10000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000056bc75e2d631000000000000000000000000000000e5448accd59566f7bd474da2e5578961b5f50130000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    // const abi =
    //   '0x095ea7b300000000000000000000000095e6f48254609a6ee006f7d493c8e5fb97094cefffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    // const result = await aaveManipulator.manipulate(abi, depositor);
    // console.log('returned ->', result);
  });
});
