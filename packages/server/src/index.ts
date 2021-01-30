import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import { Request, Response } from 'express';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as cron from 'node-cron';
import cronTask from './cron-task';

createConnection().then(connection => {
  const app = express();
  app.use(express.json());

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
