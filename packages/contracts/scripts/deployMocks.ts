import { ethers } from 'hardhat';
import { constants } from 'ethers';

import { MockDAI__factory } from '../typechain';

async function main() {
  let nonce = await (await ethers.getSigners())[0].getTransactionCount();

  const MockDAI = (await ethers.getContractFactory(
    'MockDAI',
  )) as MockDAI__factory;
  const name = 'Mocked Dai stablecoin';
  const symbol = 'DAI';
  const mockDai = await MockDAI.deploy(
    'Mocked Dai stablecoin',
    'DAI',
    constants.MaxUint256.toHexString(),
    { nonce },
  );

  console.log(
    'Deployed mock dai at: ',
    mockDai.address,
    'Verify params: [',
    name,
    symbol,
    constants.MaxUint256.toHexString(),
    ']',
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
