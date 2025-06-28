import {Container as IOContainer, ContainerModule} from 'inversify';
import {AppDataSource} from "../../../libs/data-source";
import {DataSource} from "typeorm";
import GraphqlBootstrapper from "../../../libs/graphql";
import UserService from "./modules/user/user.service";
import UserMutation from "./modules/user/user.mutation";
import RMQClient from "../../../libs/graphql/RMQClient";
import UserResolver from "./modules/user/user.resolver";
import LogGateway from "./gateway/LogGateway";

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