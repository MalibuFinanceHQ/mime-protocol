import { HardhatUserConfig } from 'hardhat/config';
import dotenv from 'dotenv';

import '@nomiclabs/hardhat-waffle';
import 'hardhat-typechain';
import 'hardhat-gas-reporter';
import '@nomiclabs/hardhat-etherscan';

dotenv.config();

const { ALCHEMY_API_KEY, DEPLOYMENT_PRIV_KEY } = process.env;

if (!ALCHEMY_API_KEY) throw new Error('No ALCHEMY_API_KEY specified in .env');

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.7.5',
        settings: {
          optimizer: {
            enabled: true,
            runs: 500,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
        blockNumber: 11704833,
      },
    },
    kovan: {
      url: 'https://kovan.infura.io/v3/9defdc016d654060a6d372cbe5b2de0c',
      accounts: [DEPLOYMENT_PRIV_KEY!],
    },
  },
  etherscan: {
    apiKey: '9SQ26N4VERJTXBWXQ4H94X4X98UZ4VFPHB',
  },
};

export default config;
