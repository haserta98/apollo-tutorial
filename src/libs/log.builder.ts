import Log from "./domain/log";

class LogBuilder {

  private type: string;
  private message: string;
  private owner: string;

  public static builder(): LogBuilder {
    return new LogBuilder();
  }

  public withType(type: string): LogBuilder {
    this.type = type;
    return this;
  }

  public withMessage(message: string): LogBuilder {
    this.message = message;
    return this;
  }

  public withOwner(owner: string): LogBuilder {
    this.owner = owner;
    return this;
  }

  public build(): Log {
    if (!this.type || !this.message) {
      throw new Error("Type and message must be provided");
    }
    return {
      type: this.type,
      message: this.message,
      owner: this.owner || "system",
    }
  }
}

export default LogBuilder;