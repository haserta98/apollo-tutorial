import {Container as IOContainer} from 'inversify';
import {DataSource} from "typeorm";
import PgGateway from "../logger/pg.logger";
import LoggingBootstrapper from "./bootstrap";
import LogProcessor from "../processor/log.processor";
import LogSubscriber from "../subscriber/subscriber";
import {AppDataSource} from "@ecommerce/libs/src/data-source";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import LogManager from "../index/manager";

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
    this.bind(DataSource).toConstantValue(AppDataSource);
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