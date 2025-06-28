import {inject, injectable} from "inversify";
import RMQClient from "../../../../libs/graphql/RMQClient";
import * as amqp from "amqplib"
import {QueueType} from "../../../../libs/constants/Queue";
import Log from "../../../../libs/domain/log";

@injectable()
class LogGateway {

  private channel: amqp.Channel;
  private QUEUE: QueueType = QueueType.LOG;

  constructor(@inject(RMQClient) private readonly rmqClient: RMQClient) {
  }

  public async connect() {
    try {
      this.channel = await this.rmqClient.getConnection().createChannel()
      await this.channel.assertQueue(this.QUEUE, {durable: false});
      console.log(`Log queue '${this.QUEUE}' created and ready for use.`);
    } catch (e) {
      console.error("Failed to create log queue and channel:", e);
      throw new Error("RabbitMQ connection failed");
    }
  }

  public async send(log: Log) {
    try {
      const messageBuffer = Buffer.from(JSON.stringify(log));
      this.channel.sendToQueue(this.QUEUE, messageBuffer);
    } catch (error) {
      console.error("Failed to send log to queue:", error);
    }
  }
}

export default LogGateway;