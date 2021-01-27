import { CopyTradingContract } from '../entities/CopyTradingContract.entity';
import { FollowedTrader } from '../entities/FollowedTrader.entity';
import {
  TradersFactory,
} from '../../../contracts/typechain';
import { Strategy } from '../entities/Strategy.entity';

export const copyTradersIndexerDefaultHandler = async (
  onContract: string,
  strategy: string,
  observedAddress: string
) => {
  const newCopyTradingContract = new CopyTradingContract();
  newCopyTradingContract.address = onContract;
  let strat = await Strategy.findOne({ address: strategy });
  if (!strat) {
    strat = new Strategy();
    strat.address = strategy;
    await strat.save();
  }
  newCopyTradingContract.strategy = strat;
  let followedTrader = await FollowedTrader.findOne({ address: observedAddress });
  if (!followedTrader) {
    followedTrader = new FollowedTrader();
    followedTrader.address = observedAddress;
    await followedTrader.save();
  }
  newCopyTradingContract.followedTrader = followedTrader;
  await newCopyTradingContract.save();
  return newCopyTradingContract;
};

export async function copyTradersIndexer(
  eventsSourceContract: TradersFactory,
  listenerFn?: (...args: any[]) => any
) {
  const handler = listenerFn ?? copyTradersIndexerDefaultHandler;
  eventsSourceContract.on('TraderCreated', handler);
}
