import {
  Entity, JoinColumn, OneToMany, BaseEntity,
  CreateDateColumn, DeleteDateColumn, UpdateDateColumn, PrimaryGeneratedColumn,
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';

@Entity()
export class PoolTopUp extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // TODO: implement required topup's fields.

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations

  @OneToMany(() => CopyTradingContract, copyTradingContract => copyTradingContract.poolTopUps)
  @JoinColumn()
  copyTradingContract: CopyTradingContract;
}
