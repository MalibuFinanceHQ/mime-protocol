import { BigNumber, providers, utils } from 'ethers';
import { getConnection } from 'typeorm';
import { CopyTraderPool } from '../common/enums';
import { CopyTradingContract } from '../entities/CopyTradingContract.entity';
import { PoolTopUp } from '../entities/PoolTopUp.entity';

export async function traderContractDepositHandler(
  txHash: string,
  provider: providers.Provider,
  contractAddress: string,
) {
  const txReceipt = await provider.getTransactionReceipt(txHash);

  let eventDecoded: utils.Result;

  try {
    eventDecoded = new utils.AbiCoder().decode(
      ['(address,uint256)', 'uint8'],
      txReceipt.logs[txReceipt.logs.length - 1].data,
    );
  } catch (e) {
    return;
  }

  const chargedAsset: string = eventDecoded[0][0];
  const chargedAmount: BigNumber = eventDecoded[0][1];
  const chargedPool: CopyTraderPool =
    eventDecoded[1] === 0 ? CopyTraderPool.RELAY : CopyTraderPool.OPERATIONS;

  const contractsRepository = getConnection().getRepository(
    CopyTradingContract,
  );

  const copyTradingContract = await contractsRepository.findOne(
    { address: contractAddress },
    { relations: ['poolTopUps'] },
  );

  if (!copyTradingContract) return;

  const topUp = new PoolTopUp();

  topUp.targetPool = chargedPool;
  topUp.amount = chargedAmount.toHexString();
  topUp.asset = chargedAsset.toLocaleLowerCase();

  copyTradingContract.poolTopUps.push(topUp);

  if (chargedPool === CopyTraderPool.RELAY) {
    const poolValue = copyTradingContract.relayPoolsBalances[chargedAsset];
    copyTradingContract.relayPoolsBalances[chargedAsset] = poolValue
      ? BigNumber.from(copyTradingContract.relayPoolsBalances[chargedAsset])
          .add(chargedAmount)
          .toHexString()
      : chargedAmount.toHexString();
  } else {
    const poolValue = copyTradingContract.operationsPoolsBalances[chargedAsset];

    copyTradingContract.operationsPoolsBalances[chargedAsset] = poolValue
      ? BigNumber.from(
          copyTradingContract.operationsPoolsBalances[chargedAsset],
        )
          .add(chargedAmount)
          .toHexString()
      : chargedAmount.toHexString();
  }

  await copyTradingContract.save();
}
