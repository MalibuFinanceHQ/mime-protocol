import { Signer, providers, constants, utils } from 'ethers';
import { CopyTradingContract } from '../entities/CopyTradingContract.entity';
import { CopyTrader__factory } from '../../../contracts/typechain';
import { validateRelayTx } from './validate-relay-tx';
import { getManager } from 'typeorm';
import { FollowedTrader } from '../entities/FollowedTrader.entity';
import { Transaction } from '../entities/Transaction.entity';

const { AddressZero } = constants;

export async function relayTx(
  relayedTxCopingTraders: CopyTradingContract[],
  tx: providers.TransactionResponse,
  signer: Signer,
) {
  console.log(
    'This transaction should be coppied -> ',
    tx,
    'By : ',
    relayedTxCopingTraders.map((trader) => trader.address),
  );

  const followedTradersRepository = getManager().getRepository(FollowedTrader);

  const followedTrader = await followedTradersRepository.findOneOrFail(
    {
      address: tx.from.toLocaleLowerCase(),
    },
    { relations: ['copiedTxns'] },
  );

  const transactionEntity = new Transaction();
  transactionEntity.hash = tx.hash.toLocaleLowerCase();
  transactionEntity.details = tx;

  let txSuccessfullRelayCount = 0;

  relayedTxCopingTraders.forEach(async (trader) => {
    const contract = CopyTrader__factory.connect(trader.address, signer);

    const { valid, gasEstimate, txSerialized, properV } = await validateRelayTx(
      contract,
      tx,
      AddressZero,
      followedTrader.address,
    );

    if (!valid) {
      console.log(`Tx. ${tx.hash} is invalid to relay skipping ...`);
      return;
    }

    console.log(`Relaying tx. ${tx.hash} in name of ${trader.address} ...`);

    const relayTx = await contract.relay(
      AddressZero,
      txSerialized!,
      properV!,
      tx.r!,
      tx.s!,
      {
        gasLimit: '5000000',
      },
    );
    txSuccessfullRelayCount++;
    trader.copiedTxns.push(transactionEntity);
    transactionEntity.relayedInTxns.push(relayTx.hash);
    console.log(
      `Tx. ${tx.hash} relayed in name of ${trader.address} txHash:${relayTx.hash}`,
    );
  });

  if (txSuccessfullRelayCount > 0) {
    followedTrader.copiedTxns.push(transactionEntity);
    await getManager().getRepository(Transaction).save(transactionEntity);
  }
}
