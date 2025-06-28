import Log from "../../../libs/domain/log";
import LogManager from "./manager";
import PgGateway from "./gateway/pg.gateway";

class LogProcessor {

  private readonly manager: LogManager = new LogManager(
    [new PgGateway()]
  );

  initialize() {
    return this.manager.initialize();
  }

  async process(payload: Log) {
    await this.manager.log(payload);
  }

}

export default LogProcessor;