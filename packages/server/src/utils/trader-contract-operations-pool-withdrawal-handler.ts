import { providers } from 'ethers';

export async function traderContractOperationPoolWithdrawalHandler(
  txHash: string,
  provider: providers.Provider,
  contractAddress: string,
) {
  console.log(`${contractAddress}, operations pool withdrawal`);
}
