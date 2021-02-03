import { Signer, providers } from 'ethers';
import { WrappedNodeRedisClient } from 'handy-redis';
import { getConnection } from 'typeorm';
import { CopyTradingContract } from '../entities/CopyTradingContract.entity';
import { relayTx } from '../utils/relay-tx';

export async function relayQueuedTransactions(
  signer: Signer,
  redis: WrappedNodeRedisClient,
) {
  const copyTradersRepository = getConnection().getRepository(
    CopyTradingContract,
  );

  const txnsHashesToRelay = await redis.keys('*');

  // txHash => contracts to copy txn.
  const relayedTxCopingTraders: Record<string, CopyTradingContract[]> = {};

  // Sort txns.
  txnsHashesToRelay.forEach(async (txHash) => {
    const txString = await redis.get(txHash);
    if (!txString) {
      return;
    }
    const tx = JSON.parse(txString) as providers.TransactionResponse;

    const copyTraders = await copyTradersRepository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.followedTrader', 'followedTrader')
      .where('followedTrader.address = :from', {
        from: tx.from.toLocaleLowerCase(),
      })
      .andWhere('entity.relaySinceNonce <= :nonce', { nonce: tx.nonce })
      .getMany();

    relayedTxCopingTraders[txHash] = copyTraders;

    await relayTx(copyTraders, tx, signer);
    await redis.del(txHash);
  });
}
