import {Message} from "amqplib";
import RmqClient from "../graphql/rmq.client";

export interface IncomingMessage<T> extends SendingMessage<T> {
  rawMessage: Message;

  reply(message: SendingMessage<any>): Promise<void>;
}

export interface SendingMessage<T> {
  key: string;
  type: string;
  payload: T;
}

export class SendingMessageBuilder<T> implements SendingMessage<T> {
  key: string;
  type: string;
  payload: T;

  private constructor() {
  }

  withKey(key: string): SendingMessageBuilder<T> {
    this.key = key;
    return this;
  }

  withType(type: string): SendingMessageBuilder<T> {
    this.type = type;
    return this;
  }

  withPayload(payload: T): SendingMessageBuilder<T> {
    this.payload = payload;
    return this;
  }

  static builder<T>(): SendingMessageBuilder<T> {
    return new SendingMessageBuilder<T>();
  }

  static from<T>(payload: string): SendingMessage<T> {
    const msg = JSON.parse(payload);
    if (!msg.key || !msg.type || !msg.payload) {
      throw new Error("Invalid message format");
    }
    return {
      key: msg.key,
      type: msg.type,
      payload: msg.payload as T
    };
  }

  build(): SendingMessage<T> {
    if (!this.key || !this.type || !this.payload) {
      throw new Error("Key, type and payload must be set before building the message");
    }
    return {
      key: this.key,
      type: this.type,
      payload: this.payload
    };
  }

}

export interface ReplyMessage<T> extends SendingMessage<T> {
  type: string;
  payload: T;
}

export class IncomingMessageBuilder<T> implements IncomingMessage<T> {
  key: string;
  rawMessage: Message;
  type: string;
  payload: T;
  client: RmqClient;

  private constructor() {
  }

  static create<T>(client: RmqClient, rawMessage: Message, type: string, payload: T, key: string): IncomingMessage<T> {
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