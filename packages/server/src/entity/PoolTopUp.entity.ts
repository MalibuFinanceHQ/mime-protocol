import {
  Entity, JoinColumn, OneToMany, BaseEntity,
  CreateDateColumn, DeleteDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Column, Index,
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';

import { BigNumberish } from 'ethers'

import { TopUpPool } from '../common/enums';

@Entity()
export class PoolTopUp extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index()
  @Column({ type: 'varchar', })
  public asset: string;

  @Column({ type: 'bigint' })
  public amount: BigNumberish;

  @Column({ type: 'enum', enum: TopUpPool })
  public targetPool: TopUpPool

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations

  @OneToMany(() => CopyTradingContract, copyTradingContract => copyTradingContract.poolTopUps)
  @JoinColumn()
  public copyTradingContract: CopyTradingContract;
}
