import { BigNumber, providers, utils } from 'ethers';
import { CopyTrader } from '../../../contracts/typechain';
import { getTxV } from './get-proper-v';

export async function validateRelayTx(
  contractInstance: CopyTrader,
  tx: providers.TransactionResponse,
  refundAsset: string,
): Promise<{
  valid: boolean;
  gasEstimate?: BigNumber;
  txSerialized?: string;
  properV?: number;
}> {
  const txSerialized = utils.serializeTransaction({
    to: tx.to,
    nonce: tx.nonce,
    data: tx.data,
    value: tx.value,
    gasLimit: tx.gasLimit,
    gasPrice: tx.gasPrice,
    chainId: tx.chainId,
  });

  const properV = getTxV(tx);

  return contractInstance.estimateGas
    .relay(refundAsset, txSerialized, properV, tx.r!, tx.s!)
    .then((gasEstimate) => ({
      valid: true,
      txSerialized,
      gasEstimate,
      properV,
    }))
    .catch(() => ({
      valid: false,
    }));
}
