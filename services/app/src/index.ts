import "reflect-metadata"
import {DataSource} from "typeorm";
import * as dotenv from "dotenv"
import LogGateway from "@ecommerce/libs/src/common/log.gateway";
import IoContainer from "./container";
import GraphqlBootstrapper from "./graphql.bootstrap";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import {logger} from "@ecommerce/libs/src/logger";

class Application {

  constructor() {
  }

  public async bootstrap() {
    dotenv.config({debug: false});

    try {
      const datasource = IoContainer.getInstance().get(DataSource);
      await datasource.initialize();
      logger.info("Data Source has been initialized!")
    } catch (error) {
      logger.error("Error during Data Source initialization:", error)
      return;
    }

    try {
      const graphqlBootstrapper = IoContainer.getInstance().get(GraphqlBootstrapper)
      await graphqlBootstrapper.initialize();
      logger.info("GraphQL has been initialized!")
    } catch (error) {
      logger.error("Error during GraphQL initialization:", error)
      return;
    }

    try {
      const client: RMQClient = IoContainer.getInstance().get(RMQClient)
      await client.connect();
    } catch (e) {
      logger.error("Error connecting to RabbitMQ:", e);
      return;
    }

    try {
      const logGateway = IoContainer.getInstance().get(LogGateway);
      await logGateway.initialize();
    } catch (e) {
      logger.error("Error connecting to Log Gateway:", e);
      return;
    }
  }
}

new Application().bootstrap()
