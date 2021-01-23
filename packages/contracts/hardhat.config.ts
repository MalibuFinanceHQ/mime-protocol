import { HardhatUserConfig } from 'hardhat/config';
import dotenv from 'dotenv';

import '@nomiclabs/hardhat-waffle';
import 'hardhat-typechain';
import 'hardhat-gas-reporter';

dotenv.config();

const { ALCHEMY_API_KEY } = process.env;

if (!ALCHEMY_API_KEY) throw new Error('No ALCHEMY_API_KEY specified in .env');

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{ version: '0.7.5' }],
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
        blockNumber: 11704833,
      },
    },
  },
};

export default config;
