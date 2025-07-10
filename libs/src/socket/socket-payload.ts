export interface SocketPayload<T = Record<string, any>> {
  target: SocketPayloadRoomTarget | SocketPayloadUserTarget | SocketPayloadBroadcastTarget;
  channel: string;
  data: T
}

interface SocketPayloadTarget {
  type: "room" | "user" | "broadcast";
}

export interface SocketPayloadRoomTarget extends SocketPayloadTarget {
  room: string;
}

export interface SocketPayloadUserTarget extends SocketPayloadTarget {
  userId: string;
}

export interface SocketPayloadBroadcastTarget extends SocketPayloadTarget {

}

export class SocketPayloadBuilder {

  private target: SocketPayloadTarget;
  private data: Record<string, any>;
  private channel: string;

  private constructor() {
  }

  static builder(): SocketPayloadBuilder {
    return new SocketPayloadBuilder();
  }

  toRoom(room: string): SocketPayloadBuilder {
    this.target = {
      type: "room",
      room: room,
    } as SocketPayloadRoomTarget;
    return this;
  }

  toUser(userId: string): SocketPayloadBuilder {
    this.target = {
      type: "user",
      userId: userId,
    } as SocketPayloadUserTarget;
    return this;
  }

  toBroadcast(): SocketPayloadBuilder {
    this.target = {
      type: "broadcast",
    } as SocketPayloadBroadcastTarget;
    return this;
  }

  withData<T>(data: T): SocketPayloadBuilder {
    this.data = data;
    return this;
  }

  withChannel(channel: string): SocketPayloadBuilder {
    this.channel = channel;
    return this;
  }

  build(): SocketPayload {
    if (!this.target) {
      throw new Error("Target must be set before building the payload");
    }
    if (!this.data) {
      this.data = {};
    }
    if (!this.channel) {
      throw new Error("Channel must be set before building the payload");
    }
    return {
      target: this.target,
      data: this.data,
      channel: this.channel,
    };
  }
}