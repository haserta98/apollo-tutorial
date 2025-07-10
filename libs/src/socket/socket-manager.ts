import {Bootable} from "../common";
import {SocketPayload, SocketPayloadRoomTarget, SocketPayloadUserTarget} from "./socket-payload";
import * as io from "socket.io";

export interface SocketManager extends Bootable {
  send<T>(payload: SocketPayload<T>): Promise<void>;

  connect(socket: io.Socket): void;

  disconnect(socket: io.Socket): void;

  join(room: string, socket: io.Socket): Promise<void>

  registerEvent(event: string, handler: SocketEventHandlerFunc): void;
}

export type SocketEventHandlerFunc = (socket: io.Socket, ...args: any[]) => void;

export abstract class AbstractSocketManager implements SocketManager {
  public abstract connect(socket: io.Socket): void

  public abstract disconnect(socket: io.Socket): void

  public abstract join(room: string, socket: io.Socket): Promise<void>

  public abstract initialize(): Promise<void>;

  public abstract registerEvent(event: string, handler: SocketEventHandlerFunc): void;

  protected abstract _sendToRoom<T>(room: string, payload: SocketPayload<T>): Promise<void>;

  protected abstract _sendToUser<T>(userId: string, payload: SocketPayload<T>): Promise<void>;

  protected abstract _sendToBroadcast<T>(payload: SocketPayload<T>): Promise<void>;

  async send<T>(payload: SocketPayload<T>): Promise<void> {
    const type = payload?.target?.type;
    if (!type) {
      throw new Error("Socket payload target type is required");
    }
    switch (type) {
      case "room":
        return this._sendToRoom((payload.target as SocketPayloadRoomTarget).room, payload);
      case "user":
        return this._sendToUser((payload.target as SocketPayloadUserTarget).userId, payload);
      case "broadcast":
        return this._sendToBroadcast(payload);
      default:
        throw new Error(`Unsupported socket payload target type: ${type}`);
    }
  }
}