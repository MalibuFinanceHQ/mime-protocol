import {
  BaseEntity,
  Entity,
  OneToMany,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';
import { CopiedTransaction } from './CopiedTransaction.entity';

@Entity()
export class FollowedTrader extends BaseEntity {
  @PrimaryColumn({
    type: 'varchar',
    unique: true,
  })
  public address: string;

  @Column({ type: 'int', default: 0 })
  public lastCachedNonce: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations

  @OneToMany(
    () => CopyTradingContract,
    (copyTradingContract) => copyTradingContract.followedTrader,
  )
  public followersContracts: CopyTradingContract[];

  @OneToMany(() => CopiedTransaction, (transaction) => transaction.copiedFrom)
  public copiedTxns: CopiedTransaction[];
}
