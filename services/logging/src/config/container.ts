import {Container as IOContainer} from 'inversify';
import {DataSource} from "typeorm";
import LoggingBootstrapper from "./bootstrap";
import LogProcessor from "../processor/log.processor";
import LogSubscriber from "../subscriber/subscriber";
import {AppDataSource} from "@ecommerce/libs/src/data-source";
import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";
import LogManager from "../index/manager";
import PgLogger from "../logger/pg.logger";

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
    this.bind(RmqClient).toSelf();
    this.bind(PgLogger).toSelf();
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