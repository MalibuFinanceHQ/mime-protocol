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
  public address: string;

  @Column({ type: 'jsonb' })
  public relayPoolsBalances: Record<string, string>;

  @Column({ type: 'jsonb' })
  public operationsPoolsBalances: Record<string, string>;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations

  @ManyToOne(() => User, user => user.copyTradingContracts)
  @JoinColumn()
  public owner: User;

  @ManyToOne(() => Strategy, strategy => strategy.copyTradingContracts)
  @JoinTable()
  public strategy: Strategy;

  @ManyToMany(() => FollowedTrader)
  @JoinTable()
  public followedTraders: FollowedTrader[];

  @OneToMany(() => PoolTopUp, poolTopUp => poolTopUp.copyTradingContract)
  public poolTopUps: PoolTopUp[];

  @OneToMany(() => Transaction, transaction => transaction.copyTradingContract)
  public relayedTxns: Transaction[];
}
