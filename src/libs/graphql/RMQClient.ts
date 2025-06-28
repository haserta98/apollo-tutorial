import * as amqp from "amqplib"
import {injectable} from "inversify";

@injectable()
class RMQClient {

  private connection: amqp.ChannelModel | null = null;

  constructor() {
  }

  public async connect() {
    if (this.connection) {
      console.warn("Already connected to RabbitMQ. Reusing existing connection.");
      return;
    }
    try {
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || "amqp://localhost:5672",
        {
          heartbeat: +process.env.RMQ_CLIENT_HEARTBEAT || 60,
          timeout: +process.env.RMQ_CLIENT_CONNECTION_TIMEOUT || 30000,
        }
      );
      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  public getConnection(): amqp.ChannelModel {
    if (!this.connection) {
      throw new Error("Connection not established. Call connect() first.");
    }
    return this.connection;
  }

}

export default RMQClient;