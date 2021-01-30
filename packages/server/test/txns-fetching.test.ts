import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import { ethers } from 'ethers';
import { step } from 'mocha-steps';
import { browseBlocks, getHashFromMatch, updateWatchListEOA, WatchedEOA } from '../src/utils/blocks-explorer';

describe('Transactions fetcher: test', () => {
  const PROVIDER = ethers.getDefaultProvider();
  const queuedAddressToFetchTxns: Set<string> = new Set();

  step('Should queue addresses with recent activity (i.e. new sent txns)', async () => {
    // Mock data
    const watchListEOA: WatchedEOA[] = [{
      address: '0xFDeda15e2922C5ed41fc1fdF36DA2FB2623666b3',
      txnsCount: 0,
    },
    {
      address: '0x00',
      txnsCount: -1,
    },
    ];

    const updatedWatchListEOA = await updateWatchListEOA(watchListEOA, PROVIDER);
    updatedWatchListEOA.forEach((updatedEOA: WatchedEOA) => {
      queuedAddressToFetchTxns.add(updatedEOA.address);
    });
    expect(queuedAddressToFetchTxns.size).toBe(1);
    expect(queuedAddressToFetchTxns.has(watchListEOA[0].address)).toBe(true);
  });

  it('Should search through previous blocks and queue matching txns to relay', async () => {
    const lastBlock = 11751715; // 4 txns for the watched address happens on block 11751715
    const txnsToRelay: Set<string> = new Set();
    const browsedBlocks = await browseBlocks(lastBlock, lastBlock, PROVIDER);

    browsedBlocks.forEach((block) => {
      const intersectedTxns = getHashFromMatch(block.transactions, queuedAddressToFetchTxns);
      intersectedTxns.forEach(tx => txnsToRelay.add(tx));
    });
    expect(txnsToRelay.size).toBe(4);
  });
});
