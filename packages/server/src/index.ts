import * as dotenv from 'dotenv';
dotenv.config();
import * as express from 'express';
import { Request, Response } from 'express';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

createConnection().then(connection => {
  const app = express();
  app.use(express.json());

  app.get('/', (req: Request, res: Response) => {
    res.end('x');
  });

  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });
});
