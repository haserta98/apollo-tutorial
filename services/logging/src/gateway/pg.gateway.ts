import {DataSource} from "typeorm";
import {inject, injectable} from "inversify";
import {Logger} from "libs/src/common";
import Log, {LogEntity} from "libs/src/domain/log";

@injectable()
class PgGateway implements Logger {

  constructor(@inject(DataSource) private datasource: DataSource) {
  }

  async connect(): Promise<void> {
  }

  async send(log: Log): Promise<void> {
    const logEntity = this.datasource.getRepository(LogEntity).create(log);
    await this.datasource.getRepository(LogEntity).save(logEntity);
  }
}

export default PgGateway;