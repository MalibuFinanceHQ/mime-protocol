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
    const account = signer ?? ethers.providers.getDefaultProvider();
    return TradersFactory__factory.connect(factoryAddr, account);
  };

  it('Should listen to TraderCreated event and populate db accordingly on catch', async () => {
    factory = getTradersFactory(process.env.TRADERS_FACTORY_ADDR);
    const payload = {
      onContract: "0x31",
      strategy: "0x32",
      observedAddress: "0x33"
    };
    const mockHandler = jest.fn(async () => copyTradersIndexerDefaultHandler("0x31", "0x32", "0x33"));
    copyTradersIndexer(factory, mockHandler);
    const newCopyTradingContract = await mockHandler();
    expect(mockHandler).toHaveBeenCalledTimes(1);
    factory.removeAllListeners('TraderCreated');
    expect(newCopyTradingContract.address).toEqual(payload.onContract);
    expect(newCopyTradingContract.strategy.address).toEqual(payload.strategy);
    expect(newCopyTradingContract.followedTrader.address).toEqual(payload.observedAddress);
  });
});
