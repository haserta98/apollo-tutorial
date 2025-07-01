import {Message} from "amqplib";
import RMQClient from "../graphql/RMQClient";

export interface IncomingMessage<T> extends SendingMessage<T> {
  rawMessage: Message;

  reply(message: SendingMessage<any>): Promise<void>;
}

export interface SendingMessage<T> {
  key: string;
  type: string;
  payload: T;
}

export class IncomingMessageBuilder<T> implements IncomingMessage<T> {
  key: string;
  rawMessage: Message;
  type: string;
  payload: T;
  client: RMQClient;

  private constructor() {
  }

  static create<T>(client: RMQClient, rawMessage: Message, type: string, payload: T, key: string): IncomingMessage<T> {
    const instance = new IncomingMessageBuilder<T>();
    instance.rawMessage = rawMessage;
    instance.type = type;
    instance.payload = payload;
    instance.client = client;
    instance.key = key;
    return instance;
  }

  reply(message: SendingMessage<any>): Promise<void> {
    return this.client.reply(this, message)
  }
}