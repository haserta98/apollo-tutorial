import * as amqp from "amqplib"
import * as dotenv from "dotenv";
import LogProcessor from "./processor";
import Log from "../../../libs/domain/log";
import {QueueType} from "../../../libs/constants/Queue";

class LoggingBootstrapper {

  private connection: amqp.ChannelModel;
  private readonly processor: LogProcessor = new LogProcessor();

  constructor() {
    dotenv.config();
  }

  async initialize() {
    await this.processor.initialize();
    await this.connect()
    await this.listenQueue();
  }

  async connect() {
    this.connection = await amqp.connect(
      process.env.RABBITMQ_URL || "amqp://localhost",
      {
        heartbeat: +process.env.RMQ_CLIENT_HEARTBEAT,
        timeout: +process.env.RMQ_CLIENT_CONNECTION_TIMEOUT,
      }
    );
  }

  async listenQueue() {
    const queue = QueueType.LOG
    const channel = await this.connection.createChannel();
    await channel.assertQueue(queue, {durable: false});
    channel.consume(
      queue,
      (message) => {
        this.onMessage(message, channel);
      }, {noAck: false}
    );
  }

  async onMessage(message: amqp.Message, channel: amqp.Channel) {
    let payload: Log;
    try {
      payload = JSON.parse(message.content.toString());
    } catch (e) {
      console.error("Failed to parse message content:", e);
      channel.reject(message, false)
      return;
    }

    try {
      await this.processor.process(payload);
      channel.ack(message);
    } catch (e) {
      console.error("Error processing message:", e);
      channel.nack(message);
    }
  }


}

export default LoggingBootstrapper;