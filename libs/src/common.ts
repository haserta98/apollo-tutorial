import Log from "./domain/log";

export interface Bootable {
  initialize(): Promise<void>;
}

export interface Processor<TPayload> {
  process(payload: TPayload): Promise<void>;
}

export interface Logger {
  connect(): Promise<void>;

  send(log: Log): Promise<void>;
}

export abstract class Subscriber<TPayload> implements Bootable {
  protected abstract subscribe(): Promise<void>;

  protected abstract unsubscribe(): Promise<void>;

  protected abstract process(payload: TPayload): Promise<void>;

  abstract initialize(): Promise<void>;
}