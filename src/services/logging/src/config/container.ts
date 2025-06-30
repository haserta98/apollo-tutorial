import {Container as IOContainer} from 'inversify';
import {AppDataSource} from "../../../../libs/data-source";
import {DataSource} from "typeorm";
import RMQClient from "../../../../libs/graphql/RMQClient";
import PgGateway from "../gateway/pg.gateway";
import LoggingBootstrapper from "./bootstrap";
import LogManager from "../manager/manager";
import LogProcessor from "../processor/processor";
import LogSubscriber from "../subscriber/subscriber";

class LogContainer extends IOContainer {

  private static instance: LogContainer | null = null;

  constructor() {
    super({
      defaultScope: "Singleton",
      autobind: true,
    });
    this.init();
  }

  private init() {
    this.bind(DataSource).toConstantValue(AppDataSource as any);
    this.bind(RMQClient).toSelf();
    this.bind(PgGateway).toSelf();
    this.bind(LogManager).toSelf();
    this.bind(LogProcessor).toSelf();
    this.bind(LoggingBootstrapper).toSelf();
    this.bind(LogSubscriber).toSelf()
  }

  public static getInstance(): LogContainer {
    if (!LogContainer.instance) {
      LogContainer.instance = new LogContainer();
    }
    return LogContainer.instance;
  }
}

export default LogContainer