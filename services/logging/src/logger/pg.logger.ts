import {DataSource} from "typeorm";
import {inject, injectable} from "inversify";
import {Logger} from "@ecommerce/libs/src/common";
import Log, {LogEntity} from "@ecommerce/libs/src/domain/log";

@injectable()
class PgLogger implements Logger {

  constructor(@inject(DataSource) private datasource: DataSource) {
  }

  async connect(): Promise<void> {
  }

  async send(log: Log): Promise<void> {
    const logEntity = this.datasource.getRepository(LogEntity).create(log);
    await this.datasource.getRepository(LogEntity).save(logEntity);
  }
}

export default PgLogger;