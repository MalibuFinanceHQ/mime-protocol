import axios from 'axios';
import * as dotenv from 'dotenv';
import { providers, BigNumber } from 'ethers';
dotenv.config();

interface JsonRpcReponseTransactionObject {
  blockHash: string;
  blockNumber: string;
  chainId: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  publicKey: string;
  r: string;
  raw: string;
  s: string;
  transactionIndex: string;
  v: string;
  value: string;
  to?: string;
}

interface GetTransactionByHashJsonRpcResponse {
  jsonrpc: string;
  id: number;
  result: JsonRpcReponseTransactionObject;
}

type PrimitiveKeys<T> = {
  [P in keyof T]: Exclude<T[P], undefined> extends object ? never : P;
}[keyof T];

type OnlyPrimitives<T> = Pick<T, PrimitiveKeys<T>>;

export type PrimitiveTransaction = OnlyPrimitives<providers.TransactionResponse>;

export async function getTransactions(
  txnsHashes: string[],
  defaultChainId?: number,
): Promise<PrimitiveTransaction[]> {
  const batches: any = [];
  txnsHashes.forEach((hash, index) => {
    batches.push({
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [hash],
      id: index,
    });
  });

  const request = await axios.post(process.env.JSON_RPC_ENDPOINT!, batches);
  const response: GetTransactionByHashJsonRpcResponse[] = request.data;

  return response.map((jsonRpcResponse) => {
    const tx = jsonRpcResponse.result;
    return {
      from: tx.from,
      to: tx.to,
      data: tx.input,
      chainId: tx.chainId
        ? BigNumber.from(tx.chainId).toNumber()
        : defaultChainId
        ? defaultChainId
        : -1,
      hash: tx.hash,
      gasLimit: tx.gas,
      gasPrice: tx.gasPrice,
      nonce: BigNumber.from(tx.nonce).toNumber(),
      value: tx.value,
      blockNumber: BigNumber.from(tx.blockNumber).toNumber(),
      v: BigNumber.from(tx.v).toNumber(),
      r: tx.r,
      s: tx.s,
      confirmations: 1,
    };
  });
}
