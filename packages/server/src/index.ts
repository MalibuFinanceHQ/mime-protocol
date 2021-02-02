import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import { Request, Response } from 'express';
import { createConnection } from 'typeorm';
import * as cron from 'node-cron';
import cronTask from './cron-task';
import { providers, Wallet } from 'ethers'

createConnection().then(connection => {
  const app = express();
  app.use(express.json());

  const provider = new providers.JsonRpcProvider(process.env.PROVIDER_URL)
  const wallet = new Wallet(process.env.PRIVATE_KEY!, provider)

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
