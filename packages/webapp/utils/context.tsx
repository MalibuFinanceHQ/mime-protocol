import { createContext } from 'react';
import { ethers } from 'ethers';
import { CopyTradingContract } from './types';

export type MimeContext = {
    currentNetworkId: number;
    requiredNetworkId: number;
    provider: ethers.providers.Web3Provider;
    account: string;
    contracts: CopyTradingContract[];
};

export const defaultCtxt: MimeContext = {
    currentNetworkId: null,
    requiredNetworkId: 42, // hardhat testnet 42
    provider: null,
    account: null,
    contracts: [],
};

const Context = createContext(defaultCtxt);

export default Context;
