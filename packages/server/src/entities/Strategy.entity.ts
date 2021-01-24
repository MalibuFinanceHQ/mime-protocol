import {
  BaseEntity, Column, OneToMany,
  PrimaryColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Entity
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';

@Entity()
export class Strategy extends BaseEntity {
  @PrimaryColumn({ unique: true, type: 'varchar' })
  public address: string;

  @Column({ type: 'varchar', nullable: true })
  public name: string;

  @Column({ type: 'varchar', nullable: true })
  public description: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public deletedAt: Date;

  // Relations

  // Contracts using this strategy
  @OneToMany(() => CopyTradingContract, copyTradingContract => copyTradingContract.strategy)
  public copyTradingContracts: CopyTradingContract[];
}
