import { providers } from 'ethers';
import { getConnection } from 'typeorm';
import { CopyTradingContract } from '../entities/CopyTradingContract.entity';
import { PrimitiveTransaction } from '../utils/jsonRpcGetTransactions';
import { traderContractDepositHandler } from '../utils/trader-contract-deposit-handler';
import { traderContractOperationPoolWithdrawalHandler } from '../utils/trader-contract-operations-pool-withdrawal-handler';
import { traderContractOperationRelayWithdrawalHandler } from '../utils/trader-contract-relay-pool-withdrawal-handler';

export async function updateContractBalances(
  provider: providers.Provider,
  blockTransactions: PrimitiveTransaction[],
) {
  const copyTradingContractRepository = getConnection().getRepository(
    CopyTradingContract,
  );

  const copyTradersContracts = await copyTradingContractRepository
    .createQueryBuilder('entity')
    .select('entity.address')
    .getMany();

  const copyTraderContractsAddresses = copyTradersContracts.map((trader) =>
    trader.address.toLocaleLowerCase(),
  );

  const copyTradersDepositsTxns = blockTransactions.filter((tx) => {
    if (
      tx.to &&
      copyTraderContractsAddresses.includes(tx.to) &&
      tx.data.slice(0, 10) === '0xeef4511c' // chargePools method identifier.
    )
      return true;
  });

  const copyTradersOperationPoolsWithdrawalsTxns = blockTransactions.filter(
    (tx) => {
      if (
        tx.to &&
        copyTraderContractsAddresses.includes(tx.to) &&
        tx.data.slice(0, 10) === '0x090ea86e' // withdrawFromOperationPool method identifier.
      )
        return true;
    },
  );

  const copyTradersRelayPoolsWithdrawalsTxns = blockTransactions.filter(
    (tx) => {
      if (
        tx.to &&
        copyTraderContractsAddresses.includes(tx.to) &&
        tx.data.slice(0, 10) === '0x32a1cad2' // withdrawFromRelayPool method identifier.
      )
        return true;
    },
  );

  // Handle actions.

  copyTradersDepositsTxns.forEach((tx, index) =>
    traderContractDepositHandler(
      tx.hash,
      provider,
      copyTraderContractsAddresses[index],
    ),
  );

  copyTradersOperationPoolsWithdrawalsTxns.forEach((tx, index) =>
    traderContractOperationPoolWithdrawalHandler(
      tx.hash,
      provider,
      copyTraderContractsAddresses[index],
    ),
  );

  copyTradersRelayPoolsWithdrawalsTxns.forEach((tx, index) =>
    traderContractOperationRelayWithdrawalHandler(
      tx.hash,
      provider,
      copyTraderContractsAddresses[index],
    ),
  );
}
