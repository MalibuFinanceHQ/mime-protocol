import { ContractTransaction, Transaction } from 'ethers';

export function getTxV(tx: Transaction | ContractTransaction): number {
  const chainID = tx.chainId || 0;
  const assumption = 27 + chainID * 2 + 8;
  const parsedV: number | undefined = tx.v;
  const finalV = parsedV === assumption ? 27 : 28;
  return finalV;
}
