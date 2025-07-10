import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn, OneToMany, ManyToOne
} from "typeorm"
import {OrderEntity} from "./order.entity";

@Entity("users")
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  username: string;

  @Column()
  firstName: string

  @Column()
  lastName: string;

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date | null = null

  @OneToMany(() => UserAddressEntity, address => address.user)
  addresses: UserAddressEntity[]

  @OneToMany(() => OrderEntity, order => order.user, {cascade: true})
  orders: OrderEntity[]
}

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
