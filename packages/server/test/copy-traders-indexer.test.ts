import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import connection from '../src/utils/connection';
import {
  TradersFactory,
  TradersFactory__factory,
} from '../../contracts/typechain';
import { ethers, Signer } from 'ethers';
import { copyTradersIndexer, copyTradersIndexerDefaultHandler } from '../src/indexers/copy-traders-creation.indexer';

beforeAll(async () => await connection.create());

afterAll(async () => await connection.close());

beforeEach(async () => await connection.clear());

describe('CopyTraders/TradersFactory: indexer', () => {
  let factory: TradersFactory;

  const getTradersFactory = (
    factoryAddr: string | undefined,
    signer?: Signer | undefined
  ): TradersFactory => {
    if (!factoryAddr) {
      throw new Error('#getTradersFactory: no factory address provided');
    }
    const account: Signer = signer ?? ethers.Wallet.createRandom();
    return TradersFactory__factory.connect(factoryAddr, account);
  };

  it('Should listen to TraderCreated event and populate db accordingly on catch', async () => {
    factory = getTradersFactory(process.env.TRADERS_FACTORY_ADDR);
    const mockHandler = jest.fn(() => copyTradersIndexerDefaultHandler("0x31", "0x32", "0x33"));
    copyTradersIndexer(factory, mockHandler);
    mockHandler();
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
