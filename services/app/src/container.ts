import {Container as IOContainer, ContainerModule} from 'inversify';
import {DataSource} from "typeorm";
import UserService from "./modules/user/user.service";
import UserMutation from "./modules/user/user.mutation";
import UserResolver from "./modules/user/user.resolver";
import LogGateway from "./gateway/LogGateway";
import GraphqlBootstrapper from "./graphql.bootstrap";
import {AppDataSource} from "libs/src/data-source";
import RMQClient from "libs/src/graphql/RMQClient";

class IoContainer extends IOContainer {

  private static instance: IoContainer | null = null;

  constructor() {
    super({
      defaultScope: "Singleton",
      autobind: true,
    });
    this.init();
  }

  private init() {
    this.bind(DataSource).toConstantValue(AppDataSource);
    this.bind(GraphqlBootstrapper).toSelf()
    this.bind(UserService).toSelf()
    this.bind(UserMutation).toSelf()
    this.bind(UserResolver).toSelf()
    this.bind(RMQClient).toSelf();
    this.bind(LogGateway).toSelf();
  }

  public static getInstance(): IoContainer {
    if (!IoContainer.instance) {
      IoContainer.instance = new IoContainer();
    }
    return IoContainer.instance;
  }
}

export default IoContainer