import { Contract } from 'ethers';

export type Indexer = (contractInstance: Contract) => void;
