import "reflect-metadata"
import {DataSource} from "typeorm"
import {LogEntity} from "./domain/log";
import {OrderEntity, OrderItemEntity} from "./domain/order";
import {UserEntity} from "./entity/user.entity";
import {UserAddressEntity} from "./entity/user-address.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) ?? 5432,
  username: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DB_NAME ?? "postgres",
  synchronize: true,
  logging: false,
  entities: [
    UserEntity,
    UserAddressEntity,
    LogEntity,
    OrderEntity,
    OrderItemEntity
  ],
  migrations: [],
  subscribers: [],
})
