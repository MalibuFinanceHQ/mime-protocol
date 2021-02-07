import CronEthersWorkerSingleton from './cron-ethers-worker-singleton';
import {
  WatchedEOA,
  updateWatchListEOA,
  browseBlocks,
  getHashFromMatch,
} from './utils/blocks-explorer';

export default async function cronTask() {
  const worker = CronEthersWorkerSingleton.getInstance();

  // TODO: populate worker.watchListEOA w/ the EOA to monitor

  worker.watchListEOA = await updateWatchListEOA(worker.watchListEOA, worker.provider);
  worker.watchListEOA.forEach((updatedEOA: WatchedEOA) => {
    worker.queuedAddressToFetchTxns.add(updatedEOA.address);
  });

  const startBlock = worker.lastBlockChecked ? worker.lastBlockChecked : await worker.getLastBlock();
  const endBlock = await worker.getLastBlock();
  const browsedBlocks = await browseBlocks(startBlock, endBlock, worker.provider);
  browsedBlocks.forEach((block) => {
    const intersectedTxns = getHashFromMatch(block.transactions, worker.queuedAddressToFetchTxns);
    intersectedTxns.forEach(tx => worker.txnsToRelay.add(tx));
    worker.lastBlockChecked = block.number;
    console.log(`Last block checked: ${worker.lastBlockChecked}`);
  });
}
