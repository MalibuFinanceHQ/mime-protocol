import { Request, Response } from 'express';
import { getManager } from 'typeorm';

import { utils } from 'ethers';
import { User } from '../entities/User.entity';

export async function getUserCopyTraders(request: Request, response: Response) {
  const usersRepository = getManager().getRepository(User);

  const address = request.query.address;

  if (typeof address !== 'string' || !utils.isAddress(address)) {
    return response.status(400).send();
  }

  const user = await usersRepository.findOne(
    { address: address.toLocaleLowerCase() },
    {
      relations: [
        'copyTradingContracts',
        'copyTradingContracts.followedTrader',
      ],
    },
  );

  if (!user) {
    return response.status(404).send();
  }

  return response.send(
    user.copyTradingContracts.map((contract) => ({
      address: contract.address,
      observedAddress: contract.followedTrader.address,
      created: contract.createdAt.toDateString(),
    })),
  );
}
