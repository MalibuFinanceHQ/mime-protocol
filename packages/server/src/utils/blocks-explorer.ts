import { ethers } from 'ethers';
import { BlockWithTransactions } from '@ethersproject/abstract-provider';

const getHashFromMatch = (
  txns: ethers.providers.TransactionResponse[],
  addresses: Set<string>
): string[] => (
  txns
    .filter((tx) => addresses.has(tx.from))
    .map((tx) => tx.hash)
);

const browseBlocks = async (
  startBlock: number,
  endBlock?: number,
  provider?: ethers.providers.Provider,
): Promise<BlockWithTransactions[]> => {
  if (!provider) provider = ethers.getDefaultProvider();
  if (!endBlock) endBlock = await provider.getBlockNumber();

  const blocksWithTransactionsPromises: Promise<BlockWithTransactions>[] = [];
  for (let idx = startBlock; idx <= endBlock; ++idx) {
    blocksWithTransactionsPromises.push(
      provider.getBlockWithTransactions(idx)
    );
  }
  const results = await Promise.allSettled(blocksWithTransactionsPromises);
  const browsedBlocks: BlockWithTransactions[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      browsedBlocks.push(result.value);
    } else {
      // TODO: notify error internally and schedule for a retry
    }
  });
  return browsedBlocks;
};

interface WatchedEOA {
  address: string,
  txnsCount: number,
}

const updateWatchListEOA = async (
  watchListEOA: WatchedEOA[],
  provider?: ethers.providers.Provider,
): Promise<WatchedEOA[]> => {
  if (!provider) provider = ethers.getDefaultProvider();

  const getTxnsCountPromises: Promise<number>[] = [];
  for (let EOA of watchListEOA) {
    getTxnsCountPromises.push(
      provider.getTransactionCount(EOA.address)
    );
  }
  const results = await Promise.allSettled(getTxnsCountPromises);
  const updatedWatchListEOA: WatchedEOA[] = [];
  results.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      const lastTxnsCount = result.value;
      if (lastTxnsCount <= watchListEOA[idx].txnsCount) {
        return; // txnsCount did not increase since previous check
      }
      const updatedWatchedEOA: WatchedEOA = {
        address: watchListEOA[idx].address,
        txnsCount: result.value,
      };
      updatedWatchListEOA.push(updatedWatchedEOA);
    } else {
      // TODO: notify error internally and schedule for a retry
    }
  });
  return updatedWatchListEOA;
};

export {
  getHashFromMatch,
  browseBlocks,
  updateWatchListEOA,
  WatchedEOA,
};