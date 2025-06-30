import * as dotenv from "dotenv"
import {DataSource} from "typeorm";
import LogContainer from "./config/container";
import LoggingBootstrapper from "./config/bootstrap";
import LogProcessor from "./processor/processor";
import {logger} from "libs/src/logger";

class LoggingService {

  constructor() {
  }

  async bootstrap() {
    dotenv.config();
    try {
      const datasource = LogContainer.getInstance().get(DataSource);
      await datasource.initialize();
      logger.info("Data Source has been initialized!")
    } catch (error) {
      logger.error("Error during Data Source initialization:", error)
      return;
    }
    try {
      const bootstrapper: LoggingBootstrapper = LogContainer.getInstance().get(LoggingBootstrapper);
      await bootstrapper.initialize();
    } catch (error) {
      logger.error("Error during Logging service initialization:", error)
      return;
    }

    try {
      const processor = LogContainer.getInstance().get(LogProcessor);
      await processor.initialize();
      logger.info("Log Processor has been initialized!");
    } catch (e) {
      logger.error("Error during Log Processor initialization:", e);
      return;
    }
  }
}

new LoggingService().bootstrap()
  .then(() => {
    logger.info("Logging service has been bootstrapped successfully!");
  })
  .catch((error) => {
    logger.error("Error bootstrapping Logging service:", error);
  });