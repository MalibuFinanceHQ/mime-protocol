import { createContext } from 'react';
import { ethers } from 'ethers';

export type MimeContext = {
  currentNetworkId: number;
  requiredNetworkId: number;
  provider: ethers.providers.Web3Provider;
  account: string;
};

export const defaultCtxt: MimeContext = {
  currentNetworkId: null,
  requiredNetworkId: 42, // Kovan testnet
  provider: null,
  account:
    typeof window !== 'undefined'
      ? window.localStorage.getItem('account')
      : null, // Current user account
};

const Context = createContext(defaultCtxt);

export default Context;
