import { CopyTradingContract } from '../entities/CopyTradingContract.entity';
import { FollowedTrader } from '../entities/FollowedTrader.entity';
import { Strategy } from '../entities/Strategy.entity';

import { TradersFactory } from '../../../contracts/typechain';
import { Repository, getManager } from 'typeorm';

import { utils } from 'ethers';
import { User } from '../entities/User.entity';
import { CopyTraderCreationEvent } from '../common/copy-trader-creation.event';

export async function copyTradersIndexer(eventsSourceContract: TradersFactory) {
  // Load database connections.
  const strategiesRepository = getManager().getRepository(Strategy);
  const usersRepository = getManager().getRepository(User);
  const followedTradersRepository = getManager().getRepository(FollowedTrader);

  const filter = {
    address: eventsSourceContract.address,
    topics: [
      utils.id('TraderCreated(address,address,address,address,uint256)'),
    ],
  };

  console.log('Starting indexer ... ');

  eventsSourceContract.on(filter, async (...logs) => {
    // Get proper log.
    const txData = logs[logs.length - 1];

    // Decode event.
    const {
      creator,
      onContract,
      strategy,
      observedAddress,
      relaySinceNonce,
    }: CopyTraderCreationEvent = txData.args;

    // Check if creator is in users table.
    let user = await usersRepository.findOne({
      address: creator.toLocaleLowerCase(),
    });
    // If user does not exist create one.
    if (!user) {
      user = new User();
      user.address = creator.toLocaleLowerCase();
      console.log(`New user ${user.address} has been created`);
      await user.save();
    }

    // Check if followed strategy is indexed one.
    let tradingStrategy = await strategiesRepository.findOne({
      address: strategy.toLocaleLowerCase(),
    });
    // If strategy does not exist create one.
    if (!tradingStrategy) {
      tradingStrategy = new Strategy();
      tradingStrategy.address = strategy.toLocaleLowerCase();
      console.log(
        `New trading strategy ${tradingStrategy.address} has been created`,
      );
      await tradingStrategy.save();
    }

    // Check if followed address is indexed trader.
    let followedTrader = await followedTradersRepository.findOne({
      address: observedAddress.toLocaleLowerCase(),
    });
    if (!followedTrader) {
      followedTrader = new FollowedTrader();
      followedTrader.address = observedAddress.toLocaleLowerCase();
      console.log(`New trader ${followedTrader.address} has been followed`);
      await followedTrader.save();
    }

    // Create copy trading contract.
    const copyTradingContract = new CopyTradingContract();
    copyTradingContract.address = onContract.toLocaleLowerCase();
    copyTradingContract.followedTrader = followedTrader;
    copyTradingContract.strategy = tradingStrategy;
    copyTradingContract.relaySinceNonce = relaySinceNonce.toNumber();
    copyTradingContract.owner = user;

    console.log(
      `New CopyTrader ${copyTradingContract.address} has been created by ${user.address}`,
    );

    await copyTradingContract.save();
  });
}
