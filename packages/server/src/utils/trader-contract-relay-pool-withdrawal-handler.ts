import { providers } from 'ethers';

export async function traderContractOperationRelayWithdrawalHandler(
  txHash: string,
  provider: providers.Provider,
  contractAddress: string,
) {
  console.log(`${contractAddress}, relay pool withdrawal`);
}
