import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';
import { FollowedTrader } from './FollowedTrader.entity';

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  public hash: string;

  // Suggestion: implement other fields such as "from" and "to".

  @Column({ type: 'jsonb' })
  public details: any;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  @Column({ type: 'varchar', default: () => 'array[]::varchar[]', array: true })
  public relayedInTxns: string[];

  // Relations

  // *From* whom the *original* tx is copied.
  @ManyToOne(
    () => FollowedTrader,
    (followedTrader) => followedTrader.copiedTxns,
  )
  public copiedFrom: FollowedTrader;

  // *For* whom the *relayed* tx is relayed.
  @ManyToMany(
    () => CopyTradingContract,
    (copyTradingContract) => copyTradingContract.copiedTxns,
  )
  @JoinTable()
  public copiedBy: CopyTradingContract[];
}
