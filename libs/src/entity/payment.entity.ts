import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {UserEntity} from "./user.entity";
import {OrderEntity} from "./order.entity";

@Entity("payments")
class PaymentEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.orders)
  user: UserEntity;

  @ManyToOne(() => OrderEntity, order => order.payments)
  order: OrderEntity;

  @Column({type: 'varchar'})
  type: string;

  @Column({type: 'varchar'})
  subType: string;

  @Column({type: 'numeric'})
  billAmount: number;

  @Column({type: 'numeric'})
  paidAmount: number;

  @Column({type: 'varchar'})
  transactionId: string;

  @Column({type: 'varchar'})
  paymentGateway: string;

  @Column({type: 'varchar'})
  paymentMethod: string;

  @Column({type: 'varchar', default: "pending"})
  paymentStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

export default PaymentEntity;