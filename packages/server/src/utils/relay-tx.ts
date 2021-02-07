import { Signer, providers, constants, BigNumber } from 'ethers';
import { CopyTradingContract } from '../entities/CopyTradingContract.entity';
import { CopyTrader__factory } from '../../../contracts/typechain';
import { validateRelayTx } from './validate-relay-tx';
import { getManager } from 'typeorm';
import { FollowedTrader } from '../entities/FollowedTrader.entity';
import { CopiedTransaction } from '../entities/CopiedTransaction.entity';
import { WrappedNodeRedisClient } from 'handy-redis';
import { TransactionCopy } from '../entities/TransactionCopy.entity';

const { AddressZero } = constants;
const DEFAULT_REFUND_ASSET = AddressZero;
const RELAY_GAS_LIMIT = BigNumber.from('5000000');

export async function relayTx(
  relayedTxCopingTraders: CopyTradingContract[],
  tx: providers.TransactionResponse,
  signer: Signer,
  redis: WrappedNodeRedisClient,
) {
  const followedTradersRepository = getManager().getRepository(FollowedTrader);

  const followedTrader = await followedTradersRepository.findOneOrFail(
    {
      address: tx.from.toLocaleLowerCase(),
    },
    { relations: ['copiedTxns'] },
  );

  let transactionEntity = new CopiedTransaction();
  transactionEntity.hash = tx.hash.toLocaleLowerCase();
  transactionEntity.details = tx;
  transactionEntity = await transactionEntity.save();

  let txSuccessfullRelayCount = 0;

  const nonce = await redis.get('wallet-nonce');
  let failedRelays = 0;

  for (let index = 0; index < relayedTxCopingTraders.length; index++) {
    const trader = relayedTxCopingTraders[index];
    const contract = CopyTrader__factory.connect(trader.address, signer);

    const { valid, gasEstimate, txSerialized, sig } = await validateRelayTx(
      contract,
      tx,
      DEFAULT_REFUND_ASSET,
      followedTrader.address,
    );

    if (!valid) {
      console.log(`Tx. ${tx.hash} is invalid to relay skipping ...`);
      ++failedRelays;
      continue;
    }

    if (!trader.relayPoolsBalances[DEFAULT_REFUND_ASSET]) {
      ++failedRelays;
      continue;
    }

    const txCost = RELAY_GAS_LIMIT.mul(tx.gasPrice);
    if (
      BigNumber.from(trader.relayPoolsBalances[DEFAULT_REFUND_ASSET]).lt(
        txCost!,
      )
    ) {
      console.log(
        `Trader balance: ${trader.relayPoolsBalances[DEFAULT_REFUND_ASSET]}`,
      );

      console.log(
        `Trader ${trader.address} couldn't afford to refund relay of tx. ${tx.hash}`,
      );
      ++failedRelays;
      continue;
    }

    console.log(`Relaying tx. ${tx.hash} in name of ${trader.address} ...`);

    const relayTx = await contract.relay(
      DEFAULT_REFUND_ASSET,
      txSerialized!,
      sig?.v!,
      sig?.r!,
      sig?.s!,
      {
        gasLimit: RELAY_GAS_LIMIT,
        nonce: Number(nonce) + index - failedRelays,
      },
    );

    await redis.incr('wallet-nonce');

    const copy = new TransactionCopy();
    copy.txHash = relayTx.hash;
    copy.base = transactionEntity;
    copy.copyExecutor = trader;

    ++txSuccessfullRelayCount;
    console.log(
      `Tx. ${tx.hash} relayed in name of ${trader.address} txHash:${relayTx.hash}`,
    );

    await copy.save();

    // TODO update trader balances in relay pool.
  }

  if (txSuccessfullRelayCount > 0) {
    followedTrader.copiedTxns.push(transactionEntity);
    await followedTrader.save();
  }
}
