import dotenv from 'dotenv';
dotenv.config();
import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.end();
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
