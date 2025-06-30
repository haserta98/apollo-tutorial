import {
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity,
  ForeignKey,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import {UserEntity} from "../../services/app/src/modules/user/user.entity";

@Entity("orders")
export class OrderEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => OrderItemEntity, orderItem => orderItem.order)
  items: OrderItemEntity[];

  @Column({type: "numeric", nullable: true, default: 0})
  totalPrice: number;

  @Column({default: "pending"})
  status: string;

  @ManyToOne(() => UserEntity, user => user.orders)
  user: UserEntity

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

@Entity("order_items")
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  productName: string;

  @Column({type: "numeric", nullable: true, default: 0})
  price: number;

  @Column({type: "numeric"})
  quantity: number;

  @ManyToOne(() => OrderEntity, order => order.items)
  order: OrderEntity;
}