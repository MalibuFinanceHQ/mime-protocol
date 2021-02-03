import { getManager } from 'typeorm';
import { providers } from 'ethers';
import { FollowedTrader } from '../entities/FollowedTrader.entity';
import { WrappedNodeRedisClient } from 'handy-redis';

export async function filterAndQueueRelayableTxnsInBlock(
  blockNumber: number,
  provider: providers.Provider,
  redis: WrappedNodeRedisClient,
) {
  // Db connection.
  const followedTradersRepository = getManager().getRepository(FollowedTrader);

  // Get followed traders from db.
  const followedTraders = await followedTradersRepository
    .createQueryBuilder('entity')
    .select('entity.address')
    .getMany();
  const followedTradersAddresses = followedTraders.map(
    (trader) => trader.address,
  );

  // Load block details.
  const block = await provider.getBlockWithTransactions(blockNumber);

  // Load block transactions.
  const blockTransactionsPromises = block.transactions.map((tx) =>
    provider.getTransaction(tx.hash),
  );
  const blockTransactions = await Promise.all(blockTransactionsPromises);

  // Filter matching txns.
  const matchingTransactions = blockTransactions.filter((tx) => {
    return followedTradersAddresses.includes(tx.from.toLocaleLowerCase());
  });

  console.log('Transactions to relay', matchingTransactions);

  for (const tx of matchingTransactions) {
    // @ts-ignore
    delete tx.wait;

    // @ts-ignore
    delete tx.creates;

    redis.set(tx.hash, JSON.stringify(tx));
  }
}
