import { Logger } from "@ecommerce/libs/src/common";
import PgLogger from "../logger/pg.logger";
import {inject} from "inversify";
import Log from "@ecommerce/libs/src/domain/log";

class LogManager {

  private readonly loggers: Logger[] = [];

  constructor(@inject(PgLogger) logger: PgLogger) {
    this.loggers = [logger];
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