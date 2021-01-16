import { HardhatUserConfig } from "hardhat/config";

import '@nomiclabs/hardhat-waffle';
import 'hardhat-typechain';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{ version: '0.7.5' }],
  },
};

export default config;