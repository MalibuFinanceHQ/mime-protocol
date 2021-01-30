import { ContractTransaction } from 'ethers';
import { serializeTransaction } from 'ethers/lib/utils';

import { getTxV } from './get-tx-v';

export function serializeContractTx(
  tx: ContractTransaction,
): {
  serialized: string;
  v: number;
  r: string;
  s: string;
} {
  const v = getTxV(tx);
  const r = tx.r!;
  const s = tx.s!;

  //@ts-ignore
  delete tx.hash;
  //@ts-ignore
  delete tx.confirmations;
  //@ts-ignore
  delete tx.blockHash;
  //@ts-ignore
  delete tx.blockNumber;
  // @ts-ignore
  delete tx.transactionIndex;
  // @ts-ignore
  delete tx.from;
  // @ts-ignore
  delete tx.r;
  // @ts-ignore
  delete tx.s;
  // @ts-ignore
  delete tx.v;
  // @ts-ignore
  delete tx.creates;
  // @ts-ignore
  delete tx.wait;

  const serialized = serializeTransaction(tx, {
    v,
    r,
    s,
  });

  return { serialized, v, r, s };
}
