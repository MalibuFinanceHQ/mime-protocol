import {
  BaseEntity, Column, ManyToMany,
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

  @ManyToMany(() => CopyTradingContract, copyTradingContract => copyTradingContract.strategies)
  public copyTradingContracts: CopyTradingContract[];
}
