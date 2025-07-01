import {inject, injectable} from "inversify";
import {Bootable, Processor} from "@ecommerce/libs/src/common";
import Log from "@ecommerce/libs/src/domain/log";
import LogManager from "../index/manager";
import {IncomingMessage} from "@ecommerce/libs/src/domain/common";

@injectable()
class LogProcessor implements Processor<Log>, Bootable {

  constructor(@inject(LogManager) private readonly logManager: LogManager) {
  }

  async initialize() {
    return this.logManager.initialize();
  }

  async process(payload: IncomingMessage<Log>) {
    await this.logManager.log(payload.payload);
  }
}

export default LogProcessor;