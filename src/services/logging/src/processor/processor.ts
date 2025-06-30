import Log from "../../../../libs/domain/log";
import LogManager from "../manager/manager";
import PgGateway from "../gateway/pg.gateway";
import {inject, injectable} from "inversify";
import {Bootable, Processor} from "../../../../libs/common";

@injectable()
class LogProcessor implements Processor<Log>, Bootable {

  constructor(@inject(LogManager) private readonly logManager: LogManager) {
  }

  async initialize() {
    return this.logManager.initialize();
  }

  async process(payload: Log) {
    await this.logManager.log(payload);
  }
}

export default LogProcessor;