import { getConnection } from 'typeorm';
import { CopyTradingContract } from '../entities/CopyTradingContract.entity';
import { PrimitiveTransaction } from '../utils/jsonRpcGetTransactions';

export async function updateContractBalances(
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
}
