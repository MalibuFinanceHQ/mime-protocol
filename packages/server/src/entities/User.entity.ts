import {
    Entity, OneToMany, PrimaryColumn,
    CreateDateColumn, DeleteDateColumn, UpdateDateColumn, BaseEntity,
} from 'typeorm';
import { CopyTradingContract } from './CopyTradingContract.entity';

// @dev A user which is the owner of one-to-many copytrading contract(s).
@Entity()
export class User extends BaseEntity {
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

    @OneToMany(() => CopyTradingContract, copyTradingContract => copyTradingContract.owner)
    public copyTradingContracts: CopyTradingContract[];
}
