import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';

import { BigNumberish } from 'ethers';

import { CopyTraderPool } from '../common/enums';

@Entity()
export class PoolWithdraw extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column({ type: 'varchar' })
  public asset: string;

  @Column({ type: 'varchar' })
  public amount: BigNumberish;

  @Column({ type: 'enum', enum: CopyTraderPool })
  public targetPool: CopyTraderPool;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations

  @ManyToOne(
    (type) => CopyTradingContract,
    (copyTradingContract) => copyTradingContract.poolWithdrawals,
  )
  public copyTradingContract: CopyTradingContract;
}
