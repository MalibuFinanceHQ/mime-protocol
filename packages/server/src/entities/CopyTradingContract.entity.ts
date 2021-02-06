import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FollowedTrader } from './FollowedTrader.entity';
import { PoolTopUp } from './PoolTopUp.entity';
import { Strategy } from './Strategy.entity';
import { User } from './User.entity';
import { Transaction } from './Transaction.entity';
import { BigNumberish } from 'ethers';
import { PoolWithdraw } from './PoolWithdraw.entity';

// @dev CopyTradingContract represents an EOA following some other trader.s's strategy.ies.
@Entity()
export class CopyTradingContract extends BaseEntity {
  @PrimaryColumn({
    type: 'varchar',
    unique: true,
  })
  public address: string;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  public relayPoolsBalances: Record<string, BigNumberish | undefined>;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  public operationsPoolsBalances: Record<string, BigNumberish | undefined>;

  @Column({ type: 'int' })
  public relaySinceNonce: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations

  @ManyToOne(() => User, (user) => user.copyTradingContracts, {
    nullable: true,
  })
  public owner: User;

  @ManyToOne(() => Strategy, (strategy) => strategy.copyTradingContracts)
  public strategy: Strategy;

  @ManyToOne(() => FollowedTrader)
  public followedTrader: FollowedTrader;

  @OneToMany((type) => PoolTopUp, (topup) => topup.copyTradingContract, {
    cascade: true,
  })
  public poolTopUps: PoolTopUp[];

  @OneToMany(
    (type) => PoolWithdraw,
    (withdrawal) => withdrawal.copyTradingContract,
    { cascade: true },
  )
  public poolWithdrawals: PoolWithdraw[];

  @ManyToMany(() => Transaction, (transaction) => transaction.copiedBy)
  public copiedTxns: Transaction[];
}
