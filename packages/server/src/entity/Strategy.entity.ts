import {
  BaseEntity, Column, ManyToMany,
  PrimaryColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Entity
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';

@Entity()
export class Strategy extends BaseEntity {
  @PrimaryColumn({ unique: true })
  name: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations

  @ManyToMany(() => CopyTradingContract, copyTradingContract => copyTradingContract.strategies)
  copyTradingContracts: CopyTradingContract[];
}
