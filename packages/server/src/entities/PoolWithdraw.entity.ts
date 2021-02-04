import {
  Entity,
  JoinColumn,
  OneToMany,
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';

import { BigNumberish } from 'ethers';

import { TopUpPool } from '../common/enums';

@Entity()
export class PoolWithdraw extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column({ type: 'varchar' })
  public asset: string;

  @Column({ type: 'bigint' })
  public amount: BigNumberish;

  @Column({ type: 'enum', enum: TopUpPool })
  public targetPool: TopUpPool;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations

  @OneToMany(
    () => CopyTradingContract,
    (copyTradingContract) => copyTradingContract.poolWithdrawals,
  )
  @JoinColumn()
  public copyTradingContract: CopyTradingContract;
}
