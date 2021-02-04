import { Signer, providers } from 'ethers';
import { CopyTradingContract } from '../entities/CopyTradingContract.entity';

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
}
