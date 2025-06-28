import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn, OneToMany
} from "typeorm"
import {UserAddressEntity} from "./user-address.entity";

@Entity()
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number

  @Column({unique: true, nullable: false})
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
}
