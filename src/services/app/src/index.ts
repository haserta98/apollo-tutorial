import "reflect-metadata"
import {DataSource} from "typeorm";
import * as dotenv from "dotenv"
import LogGateway from "./gateway/LogGateway";
import IoContainer from "./container";
import GraphqlBootstrapper from "../../../libs/graphql";
import RMQClient from "../../../libs/graphql/RMQClient";

class Application {

  constructor() {
  }

  public async bootstrap() {
    dotenv.config();
    try {
      const datasource = IoContainer.getInstance().get(DataSource);
      await datasource.initialize();
      console.log("Data Source has been initialized!")
    } catch (error) {
      console.error("Error during Data Source initialization:", error)
      return;
    }

    try {
      const graphqlBootstrapper = IoContainer.getInstance().get(GraphqlBootstrapper)
      await graphqlBootstrapper.initialize();
      console.log("GraphQL has been initialized!")
    } catch (error) {
      console.error("Error during GraphQL initialization:", error)
      return;
    }

    try {
      const client: RMQClient = IoContainer.getInstance().get(RMQClient)
      await client.connect();
    } catch (e) {
      console.error("Error connecting to RabbitMQ:", e);
      return;
    }

    try {
      const logGateway = IoContainer.getInstance().get(LogGateway);
      await logGateway.connect();
    } catch (e) {
      console.error("Error connecting to Log Gateway:", e);
      return;
    }
  }
}

new Application().bootstrap()
