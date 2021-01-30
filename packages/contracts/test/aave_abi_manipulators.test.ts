import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { AaveManipulator, AaveManipulator__factory } from '../typechain';
import { expect } from 'chai';

const calcABIOffsets = (
  abi: string,
  paramsNames: Array<string>,
  paramsSize: Array<number>,
) => {
  const positions = paramsNames.map(() => [0, 0]);
  let ofs = 0;
  paramsSize.forEach((size, idx) => {
    positions[idx] = [ofs, ofs + size * 2];
    ofs += size * 2;
  });

  // Object.keys(positions).forEach((key: string, idx: number) => {
  //   // @ts-ignore
  //   const [start, end] = positions[key];
  //   // console.log(`${paramsNames[idx]} -> "${abi.slice(start, end)}" (${start}, ${end})`);
  // });
  return positions;
};

describe('Aave ABI manipulators: test', () => {
  let accounts: Signer[];
  let aaveManipulator: AaveManipulator;
  let firstSigner: Signer;

  before(async () => {
    accounts = await ethers.getSigners();

    aaveManipulator = await (<AaveManipulator__factory>(
      await ethers.getContractFactory('AaveManipulator')
    )).deploy();

    firstSigner = accounts[0];
  });

  it('Should make an ABI manipulation for Aave: lendingpool deposit', async () => {
    // deposit parameters (4):
    const asset = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
    const amount = 100000000000000;
    const onBehalfOf = '0xf3a10F5827Aca0015a98C003907C149a8d9E0048'; // Random address
    const referralCode = 0;

    const padNb = (nb: number, padBytesLen = 32) =>
      nb.toString(16).padStart(padBytesLen * 2, '0');
    const padStr = (str: string, padBytesLen = 32) =>
      str.replace('0x', '').padStart(padBytesLen * 2, '0');
    const methodID = '0xe8eda9df'; // bytes4(keccak256("deposit(address,uint256,address,uint16)"))
    const abi = `${methodID}${padStr(asset)}${padNb(amount)}${padStr(
      onBehalfOf,
    )}${padNb(referralCode)}`;

    const firstSignerAddr = await firstSigner.getAddress();
    const manipulated = await aaveManipulator.manipulate(abi, firstSignerAddr);
    const offsets = calcABIOffsets(
      manipulated,
      ['methodID', 'asset', 'amount', 'onBehalfOf', 'referralCode'],
      [1 + 4, 32, 32, 32, 32],
    );
    const [start, end] = offsets[3]; // onBehalfOf slice positions
    const manipulatedOnBehalfOf = manipulated.slice(start, end);
    expect(`0x${manipulatedOnBehalfOf.slice(24).toLocaleLowerCase()}`).to.equal(
      firstSignerAddr.toLocaleLowerCase(),
    );
  });
});
