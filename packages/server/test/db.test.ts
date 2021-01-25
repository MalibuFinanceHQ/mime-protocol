import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import connection from '../src/utils/connection';
import { User } from '../src/entities/User.entity';
import { CopyTradingContract } from '../src/entities/CopyTradingContract.entity';

beforeAll(async () => await connection.create());

afterAll(async () => await connection.close());

beforeEach(async () => await connection.clear());

it('Creates a user', async () => {
  const user = new User();
  const copyTradingContract = new CopyTradingContract();
  copyTradingContract.owner = user;
  copyTradingContract.address = '0x01';
  user.address = '0x00';
  user.copyTradingContracts = [copyTradingContract];
  await user.save();

  expect(user.address).toEqual('0x00');
  expect(user.copyTradingContracts.length).toBe(1);
  expect(user.copyTradingContracts[0].owner).toBe(user);
  expect(user.copyTradingContracts[0].address).toEqual('0x01');
});
