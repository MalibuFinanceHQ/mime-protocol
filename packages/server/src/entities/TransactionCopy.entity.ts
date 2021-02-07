import { BaseEntity, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { CopiedTransaction } from './CopiedTransaction.entity';
import { CopyTradingContract } from './CopyTradingContract.entity';

@Entity()
export class TransactionCopy extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  public txHash: string;

  @ManyToOne((type) => CopiedTransaction, (base) => base.copies)
  public base: CopiedTransaction;

  @ManyToOne((type) => CopyTradingContract, (executor) => executor.copiedTxns)
  public copyExecutor: CopyTradingContract;
}
