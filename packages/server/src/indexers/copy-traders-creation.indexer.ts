import { Repository } from 'typeorm';
import { TradersFactory } from '../../../contracts/typechain'
import { CopyTradingContract } from '../entities/CopyTradingContract.entity';


export async function copyTradersIndexer(eventsSourceContract: TradersFactory, repository: Repository<CopyTradingContract>) { };
