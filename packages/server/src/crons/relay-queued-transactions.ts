import { Signer, providers } from 'ethers';
import { WrappedNodeRedisClient } from 'handy-redis';
import { getConnection, LessThanOrEqual } from 'typeorm';
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
    if (txHash === 'wallet-nonce') return;

    const txString = await redis.get(txHash);
    if (!txString) {
      return;
    }
    const tx = JSON.parse(txString) as providers.TransactionResponse;

    const copyTraders = await copyTradersRepository.find({
      relations: ['copiedTxns', 'followedTrader'],
      where: {
        followedTrader: { address: tx.from.toLocaleLowerCase() },
        relaySinceNonce: LessThanOrEqual(tx.nonce),
      },
    });

    relayedTxCopingTraders[txHash] = copyTraders;

    await relayTx(copyTraders, tx, signer, redis);
    await redis.del(txHash);
  });
}
