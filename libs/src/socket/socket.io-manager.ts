import {inject, injectable} from "inversify";
import {RedisSocketSessionManager, SocketSessionPayload} from "./socket-session-manager";
import * as http from "node:http";
import * as io from "socket.io";
import {createAdapter} from "@socket.io/redis-adapter";
import {logger} from "../logger";
import {SocketPayload} from "./socket-payload";
import * as jwt from "jsonwebtoken"
import {AbstractSocketManager, SocketEventHandlerFunc} from "./socket-manager";

@injectable()
export class SocketIoManager extends AbstractSocketManager {

  private server: http.Server;
  private io: io.Server;

  private readonly events: Record<string, SocketEventHandlerFunc> = {};

  protected constructor(@inject(RedisSocketSessionManager) private readonly sessionManager: RedisSocketSessionManager) {
    super();
  }

  async initialize(): Promise<void> {
    this.server = http.createServer();
    this.io = new io.Server(this.server, {
      cors: {
        origin: "*"
      }
    });
    const {pubClient, subClient} = await this.sessionManager.initialize();
    const adapter = createAdapter(pubClient, subClient);
    this.io.adapter(adapter);

    this.server.listen(3002, () => {
      logger.info("Socket.IO server is running on port 3002");
    });

    this.io.on("connection", (socket: io.Socket) => this.connect(socket))
    this.io.on("disconnect", (socket: io.Socket) => this.disconnect(socket));
    this.io.on("connection", (socket: io.Socket) => {
      logger.info(`Socket connected: ${socket.id}`);
      socket.on("disconnect", () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  public async connect(socket: io.Socket): Promise<void> {
    const userId = this.getUserIdFromSocket(socket);
    const payload: SocketSessionPayload = {
      socketId: socket.id,
      userId: userId,
      roomId: ""
    }
    try {
      await this.sessionManager.join(payload);
      await socket.join(userId);
      this.listenEvents(socket);
    } catch (e) {
      logger.error(`Failed to join session for user ${userId}:`, e);
      throw new Error(`Failed to connect user ${userId}`);
    }
  }

  public async disconnect(socket: io.Socket): Promise<void> {
    const userId = this.getUserIdFromSocket(socket);
    try {
      await this.sessionManager.disconnect(userId);
      socket.leave(userId);
      socket.disconnect(true);
    } catch (e) {
      logger.error(`Failed to disconnect user ${userId}:`, e);
      throw new Error(`Failed to disconnect user ${userId}`);
    }
  }

  public async join(room: string, socket: io.Socket): Promise<void> {
    socket.join(room);
  }

  registerEvent(event: string, handler: SocketEventHandlerFunc): void {
    this.events[event] = handler;
  }

  async _sendToRoom<T>(room: string, payload: SocketPayload<T>): Promise<void> {
    if (!room) {
      throw new Error("Room name is required to send a message");
    }
    if (!this.io) {
      throw new Error("Socket.IO server is not initialized");
    }
    this.io.to(room).emit(payload.channel, payload.data);
  }

  async _sendToUser<T>(userId: string, payload: SocketPayload<T>): Promise<void> {
    if (!userId) {
      throw new Error("User ID is required to send a message");
    }
    if (!this.io) {
      throw new Error("Socket.IO server is not initialized");
    }
    const sessionData = await this.sessionManager.getSessionData(userId);
    if (!sessionData || !sessionData.socketId) {
      throw new Error(`No active session found for user: ${userId}`);
    }
    this.io.to(sessionData.socketId).emit(payload.channel, payload.data);
  }

  async _sendToBroadcast<T>(payload: SocketPayload<T>): Promise<void> {
    if (!this.io) {
      throw new Error("Socket.IO server is not initialized");
    }
    this.io.emit(payload.channel, payload.data);
  }

  protected getUserIdFromSocket(socket: io.Socket): string {
    const token = socket?.handshake?.auth?.token ?? "";
    if (!token) {
      socket.disconnect(true);
      logger.error("Missing authorization token in socket handshake");
      return;
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"]
      });
      const userId = payload.sub;
      if (!userId || typeof userId != "string") {
        socket.disconnect(true);
        logger.error("Missing token sub field");
        return
      }
      return userId;
    } catch (e) {

      logger.error("There is an error occurred when the user authenticated on ecommerce", e);
      socket.disconnect(true);
    }
  }

  private listenEvents(socket: io.Socket) {
    for (const [event, handler] of Object.entries(this.events)) {
      socket.on(event, (data: any) => {
        handler(socket, data)
      });
    }
  }
}