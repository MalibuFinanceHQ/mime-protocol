import {
  BaseEntity, Column, CreateDateColumn, DeleteDateColumn,
  Entity, JoinColumn, JoinTable,
  OneToMany, ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn
} from 'typeorm';
import { FollowedTrader } from './FollowedTrader.entity';
import { PoolTopUp } from './PoolTopUp.entity';
import { Strategy } from './Strategy.entity';
import { User } from './User.entity';
import { Transaction } from './Transaction.entity';

// @dev CopyTradingContract represents an EOA following some other trader.s's strategy.ies.
@Entity()
export class CopyTradingContract extends BaseEntity {
  @PrimaryColumn({
    type: 'varchar',
    unique: true,
  })
  address: string;

  @Column({ type: 'jsonb' })
  relayPools: Record<string, string>;

  @Column({ type: 'jsonb' })
  operationsPools: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations

  @ManyToOne(() => User, user => user.copyTradingContracts)
  @JoinColumn()
  owner: User;

  @ManyToMany(() => Strategy)
  @JoinTable()
  strategies: Strategy[];

  @ManyToMany(() => FollowedTrader)
  @JoinTable()
  followedTraders: FollowedTrader[];

  @OneToMany(() => PoolTopUp, poolTopUp => poolTopUp.copyTradingContract)
  poolTopUps: PoolTopUp[];

  @OneToMany(() => Transaction, transaction => transaction.copyTradingContract)
  relayedTxns: Transaction[];
}
