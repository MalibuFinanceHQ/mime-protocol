import { Request, Response } from 'express';
import { getManager } from 'typeorm';
import { Strategy } from '../entities/Strategy.entity';

export async function getAvailableStrategies(
  request: Request,
  response: Response,
) {
  const strategiesRepository = getManager().getRepository(Strategy);

  const strategies = await strategiesRepository.find();

  return response.send(
    strategies.map((strategy) => ({
      name: strategy.name,
      description: strategy.description,
      address: strategy.address,
    })),
  );
}
