import { ethers } from 'ethers';
import {
  WatchedEOA,
} from './utils/blocks-explorer';

export default class CronEthersWorkerSingleton {
  private constructor() { }

  private static instance: CronEthersWorkerSingleton;

  public static getInstance(): CronEthersWorkerSingleton {
    if (!CronEthersWorkerSingleton.instance) {
      CronEthersWorkerSingleton.instance = new CronEthersWorkerSingleton();
      // TODO: pass options to getDefaultProvider
      // (using API keys increases rate limits etc.)
      CronEthersWorkerSingleton.instance._provider = ethers
        .getDefaultProvider(process.env.ETHERS_JS_NETWORK);
      CronEthersWorkerSingleton.instance.queuedAddressToFetchTxns = new Set();
      CronEthersWorkerSingleton.instance.txnsToRelay = new Set();
      CronEthersWorkerSingleton.instance.watchListEOA = [];
    }
    return CronEthersWorkerSingleton.instance;
  }

  private _provider: ethers.providers.Provider;

  get provider(): ethers.providers.Provider {
    return this._provider;
  }

  set provider(newProvider: ethers.providers.Provider) {
    this._provider = newProvider;
  }

  public lastBlockChecked: number;

  public getLastBlock(): Promise<number> {
    return this._provider.getBlockNumber();
  }

  public watchListEOA: WatchedEOA[];

  public queuedAddressToFetchTxns: Set<string>;

  public txnsToRelay: Set<string> = new Set();
}
