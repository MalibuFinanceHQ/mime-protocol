import { getManager } from 'typeorm';
import { providers } from 'ethers';
import { FollowedTrader } from '../entities/FollowedTrader.entity';
import { WrappedNodeRedisClient } from 'handy-redis';
import {
  getTransactions,
  PrimitiveTransaction,
} from '../utils/json-rpc-fetch-block-txns';

export async function filterAndQueueRelayableTxnsInBlock(
  blockTransactions: PrimitiveTransaction[],
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

  // Filter matching txns.
  const matchingTransactions = blockTransactions.filter((tx) => {
    return followedTradersAddresses.includes(tx.from.toLocaleLowerCase());
  });

  for (const tx of matchingTransactions) {
    redis.set(tx.hash, JSON.stringify(tx));
  }
}
