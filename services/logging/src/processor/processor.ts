import LogManager from "../manager/manager";
import {inject, injectable} from "inversify";
import {Bootable, Processor} from "libs/src/common";
import Log from "libs/src/domain/log";

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