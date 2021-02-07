import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import { Request, Response } from 'express';
import * as cors from 'cors';
import { createConnection } from 'typeorm';
import { providers, Wallet } from 'ethers';
import * as cron from 'node-cron';

import { createNodeRedisClient } from 'handy-redis';

import { TradersFactory__factory } from '../../contracts/typechain';

import { copyTradersIndexer } from './indexers/copy-traders-creation.indexer';

import { AppRoutes } from './api/routes';
import { relayQueuedTransactions } from './crons/relay-queued-transactions';
import { onNewBlockHandler } from './crons/on-new-block-handler';
import connection from './utils/connection';

createConnection().then(async () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  // Ethereum connection singletons.
  const provider = new providers.WebSocketProvider(process.env.PROVIDER_URL!);
  const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);
  const factoryContract = TradersFactory__factory.connect(
    process.env.FACTORY_CONTRACT!,
    wallet,
  );

  // Redis connection.
  const redis = createNodeRedisClient({
    url: process.env.REDIS_URL,
  });

  // Cache signer nonce.
  const nonce = (await wallet.getTransactionCount()).toString();
  await redis.set('wallet-nonce', nonce);
  console.log(`Initialzing wallet current nonce ${nonce}`);

  // Start indexers
  copyTradersIndexer(factoryContract);

  provider.on('block', (blockNumber: number) => {
    onNewBlockHandler(blockNumber, provider, redis);
  });

  // provider.on('pending', (tx) => console.log(tx));

  cron.schedule(process.env.CRON_SCHEDULE || '*/15 * * * * * *', () =>
    relayQueuedTransactions(wallet, redis),
  );

  // Defaults to a 15 seconds interval
  // cron.schedule(process.env.CRON_SCHEDULE || '*/15 * * * * * *', cronTask);

  AppRoutes.forEach((route) => {
    // @ts-ignore
    app[route.method](
      route.path,
      (request: Request, response: Response, next: (params: any[]) => void) => {
        route
          .action(request, response)
          .then(() => next)
          .catch((err) => next(err));
      },
    );
  });

  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server started`);
  });
  process.on('exit', () => connection.close());
});
