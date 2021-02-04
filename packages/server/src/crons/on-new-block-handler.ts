import { providers } from 'ethers';
import { WrappedNodeRedisClient } from 'handy-redis';

import { getTransactions } from '../utils/jsonRpcGetTransactions';

import { filterAndQueueRelayableTxnsInBlock } from './queue-txns-to-relay';
import { updateContractBalances } from './update-contract-balances';

export async function onNewBlockHandler(
  blockNumber: number,
  provider: providers.Provider,
  redis: WrappedNodeRedisClient,
) {
  // Load block details.
  const block = await provider.getBlockWithTransactions(blockNumber);

  // Load block transactions.
  const blockTransactions = await getTransactions(
    block.transactions.map((tx) => tx.hash),
    (await provider.getNetwork()).chainId,
  );

  filterAndQueueRelayableTxnsInBlock(blockTransactions, redis);
  updateContractBalances(blockTransactions);
}
