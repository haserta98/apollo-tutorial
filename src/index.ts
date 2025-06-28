import "reflect-metadata"
import {DataSource} from "typeorm";
import GraphqlBootstrapper from "./graphql";
import IoContainer from "./container";
import * as dotenv from "dotenv"

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
  }
}

new Application().bootstrap()
