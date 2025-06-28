import Log from "../../../../libs/domain/log";

interface Logger {
  connect(): Promise<void>;

  send(log: Log): Promise<void>;
}

export default Logger;