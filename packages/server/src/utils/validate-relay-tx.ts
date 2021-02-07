import { BigNumber, providers, utils } from 'ethers';
import { CopyTrader } from '../../../contracts/typechain';
import { getTxV } from './get-proper-v';

// TODO fix gas estimator + parse signatures when compressed.
export async function validateRelayTx(
  contractInstance: CopyTrader,
  tx: providers.TransactionResponse,
  refundAsset: string,
  expectedSigner: string,
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

  const recoveredSigner = utils.recoverAddress(utils.keccak256(txSerialized), {
    v: properV,
    r: tx.r!,
    s: tx.s!,
  });

  if (
    recoveredSigner.toLocaleLowerCase() !== expectedSigner.toLocaleLowerCase()
  ) {
    console.log(
      `Invalid signer expected: ${expectedSigner} recovered: ${recoveredSigner}`,
    );
    return { valid: false };
  }

  return contractInstance.estimateGas
    .relay(refundAsset, txSerialized, properV, tx.r!, tx.s!)
    .then((gasEstimate) => ({
      valid: true,
      txSerialized,
      gasEstimate,
      properV,
    }))
    .catch((e) => {
      console.log(e);
      return {
        valid: false,
        txSerialized,
        properV,
      };
    });
}
