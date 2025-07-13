import {logger} from "@ecommerce/libs/src/logger";
import * as dotenv from "dotenv";
import {DataSource} from "typeorm";
import PaymentContainer from "./config/container";
import PaymentBootstrapper from "./config/bootstrap";

class PaymentService {

  async bootstrap() {
    dotenv.config({debug: false});
    try {
      const datasource = PaymentContainer.getInstance().get(DataSource);
      await datasource.initialize();
      logger.info("Data Source has been initialized!")
    } catch (error) {
      logger.error("Error during Data Source initialization:", error)
      return;
    }

    const orderBootstrapper = PaymentContainer.getInstance().get(PaymentBootstrapper);
    try {
      await orderBootstrapper.bootstrap();
      logger.info("Order service has been initialized!");
    } catch (error) {
      logger.error("Error during Order service initialization:", error);
      return;
    }
  }
}

new PaymentService().bootstrap()
  .then(() => {
    logger.info("Payment service has been bootstrapped successfully!");
  })
  .catch((error) => {
    logger.error("Error bootstrapping Payment service:", error);
  });
