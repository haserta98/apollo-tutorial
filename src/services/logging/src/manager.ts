import Logger from "./gateway/log.gateway";
import Log from "../../../libs/domain/log";

class LogManager {

  private readonly loggers: Logger[] = [];

  constructor(loggers: Logger[]) {
    this.loggers = loggers;
  }

  initialize() {
    return Promise.all(this.loggers.map(logger => logger.connect()));
  }

  public async log(log: Log) {
    for (const logger of this.loggers) {
      await logger.send(log)
    }
  }

}

export default LogManager;