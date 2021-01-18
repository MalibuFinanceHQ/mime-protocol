import {
  BaseEntity, Column, Entity, ManyToOne, PrimaryColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';
import { FollowedTrader } from './FollowedTrader.entity';

export type TransactionType = 'unknown' | 'copied' | 'relayed';

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryColumn()
  hash: string;

  // Suggestion: implement other fields such as "from" and "to".

  @Column('json')
  details: JSON;

  @Column({
    type: 'enum',
    enum: ['unknown', 'copied', 'relayed'],
    default: 'unknown',
  })
  type: TransactionType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations

  // *From* whom the *original* tx is copied.
  @ManyToOne(() => FollowedTrader, followedTrader => followedTrader.copiedTxns)
  followedTrader: FollowedTrader;

  // *For* whom the *relayed* tx is relayed.
  @ManyToOne(() => CopyTradingContract, copyTradingContract => copyTradingContract.relayedTxns)
  copyTradingContract: CopyTradingContract;
}
