import "reflect-metadata"
import {DataSource} from "typeorm"
import {UserEntity} from "../services/app/src/modules/user/user.entity"
import {UserAddressEntity} from "../services/app/src/modules/user/user-address.entity";
import {LogEntity} from "./domain/log";

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
    LogEntity
  ],
  migrations: [],
  subscribers: [],
})
