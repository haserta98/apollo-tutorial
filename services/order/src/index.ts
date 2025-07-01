import {logger} from "@ecommerce/libs/src/logger";
import * as dotenv from "dotenv";
import {DataSource} from "typeorm";
import OrderContainer from "./config/container";
import OrderBootstrapper from "./config/bootstrap";

class OrderService {

  async bootstrap() {
    dotenv.config({debug: false});
    try {
      const datasource = OrderContainer.getInstance().get(DataSource);
      await datasource.initialize();
      logger.info("Data Source has been initialized!")
    } catch (error) {
      logger.error("Error during Data Source initialization:", error)
      return;
    }

    const orderBootstrapper = OrderContainer.getInstance().get(OrderBootstrapper);
    try {
      await orderBootstrapper.bootstrap();
      logger.info("Order service has been initialized!");
    } catch (error) {
      logger.error("Error during Order service initialization:", error);
      return;
    }
  }

}

new OrderService().bootstrap()
  .then(() => {
    logger.info("Order service has been bootstrapped successfully!");
  })
  .catch((error) => {
    logger.error("Error bootstrapping Order service:", error);
  });
