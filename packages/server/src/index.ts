import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import { Request, Response } from 'express';
import { createConnection } from 'typeorm';
import * as cron from 'node-cron';
import cronTask from './cron-task';
import { providers, Wallet } from 'ethers';

import { CopyTradingContract } from './entities/CopyTradingContract.entity';
import {
  TradersFactory,
  TradersFactory__factory,
} from '../../contracts/typechain';

createConnection().then((connection) => {
  const app = express();
  app.use(express.json());

  // Ethereum connection singletons.
  const provider = new providers.JsonRpcProvider(process.env.PROVIDER_URL);
  const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);
  const factoryContract = TradersFactory__factory.connect('', wallet);

  // Database connection singletons.
  const copyTradersRepository = connection.getRepository(CopyTradingContract);

  // Defaults to a 15 seconds interval
  cron.schedule(process.env.CRON_SCHEDULE || '*/30 * * * * * *', cronTask);

  app.get('/', (req: Request, res: Response) => {
    res.end('x');
  });

  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server started`);
  });
});
