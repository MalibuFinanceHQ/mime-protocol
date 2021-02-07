import { isAddress } from 'ethers/lib/utils';
import { Request, Response } from 'express';
import { getManager } from 'typeorm';
import { CopyTradingContract } from '../entities/CopyTradingContract.entity';

export async function getRelayedTxns(request: Request, response: Response) {
  const copyTraderAddress = request.query.address;

  if (
    !copyTraderAddress ||
    typeof copyTraderAddress !== 'string' ||
    !isAddress(copyTraderAddress)
  ) {
    return response.status(404).send();
  }

  const repository = getManager().getRepository(CopyTradingContract);

  const trader = await repository.findOne(
    { address: copyTraderAddress.toLocaleLowerCase() },
    {
      relations: ['copiedTxns', 'copiedTxns.base'],
    },
  );

  return response.send(
    trader?.copiedTxns.map((tx) => ({
      txHash: tx.txHash,
      baseTxHash: tx.base.hash,
    })),
  );
}
