import {
  BaseEntity, Entity, OneToMany, ManyToMany, PrimaryColumn,
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
  address: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations

  @ManyToMany(() => CopyTradingContract, copyTradingContract => copyTradingContract.followedTraders)
  followersContracts: CopyTradingContract[];

  @OneToMany(() => Transaction, transaction => transaction.followedTrader)
  copiedTxns: Transaction[];
}
