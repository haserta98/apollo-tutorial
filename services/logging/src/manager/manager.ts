import { Logger } from "libs/src/common";
import PgGateway from "../gateway/pg.gateway";
import {inject} from "inversify";
import Log from "libs/src/domain/log";

class LogManager {

  private readonly loggers: Logger[] = [];

  constructor(@inject(PgGateway) gateway: PgGateway) {
    this.loggers = [gateway];
  }

  async initialize() {
    await Promise.all(this.loggers.map(logger => logger.connect()));
  }

  public async log(log: Log) {
    for (const logger of this.loggers) {
      await logger.send(log)
    }
  }

}

export default LogManager;