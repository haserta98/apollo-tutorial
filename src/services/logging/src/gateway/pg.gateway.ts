import Log, {LogEntity} from "../../../../libs/domain/log";
import Logger from "./log.gateway";
import {DataSource} from "typeorm";
import {AppDataSource} from "../../../../libs/data-source";

class PgGateway implements Logger {

  private datasource: DataSource

  async connect(): Promise<void> {
    this.datasource = await AppDataSource.initialize();
    console.log("Connected to PostgreSQL database for Logging");
  }

  async send(log: Log): Promise<void> {
    const logEntity = this.datasource.getRepository(LogEntity).create(log);
    await this.datasource.getRepository(LogEntity).save(logEntity);
  }
}

export default PgGateway;