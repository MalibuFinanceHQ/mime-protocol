import {
  BaseEntity, Entity, OneToMany, PrimaryColumn,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';
import { Transaction } from './Transaction.entity';

@Entity()
export class FollowedTrader extends BaseEntity {
  @PrimaryColumn({
    type: 'varchar',
    unique: true,
  })
  public address: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations

  @OneToMany(() => CopyTradingContract, copyTradingContract => copyTradingContract.followedTrader)
  public followersContracts: CopyTradingContract[];

  @OneToMany(() => Transaction, transaction => transaction.copiedFrom)
  public copiedTxns: Transaction[];
}
