import {
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ForeignKey,
  ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {UserEntity} from "./user.entity";

@Entity("user_addresses")
export class UserAddressEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  city: string;

  @Column()
  street: string;

  @Column()
  houseNumber: string;

  @Column({nullable: true})
  postalCode: string;

  @Column({nullable: true})
  additionalInfo: string;

  @Column({default: true})
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => UserEntity, user => user.addresses)
  user: UserEntity;
}