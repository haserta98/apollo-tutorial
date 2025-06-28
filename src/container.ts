import {Container as IOContainer, ContainerModule} from 'inversify';
import {AppDataSource} from "./data-source";
import {DataSource} from "typeorm";
import GraphqlBootstrapper from "./graphql";
import UserService from "./modules/user/user.service";
import UserMutation from "./modules/user/user.mutation";

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
  }

  public static getInstance(): IoContainer {
    if (!IoContainer.instance) {
      IoContainer.instance = new IoContainer();
    }
    return IoContainer.instance;
  }
}

export default IoContainer