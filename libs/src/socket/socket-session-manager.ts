import {Redis} from "ioredis";
import {logger} from "../logger";
import {injectable} from "inversify";

export interface SocketSessionPayload {
  socketId: string;
  userId: string;
  roomId: string;
}

export interface SocketSessionManager<TSessionData> {
  join(data: TSessionData): Promise<void>

  getSessionData(id: string): Promise<TSessionData>;

  leave(id: string): Promise<void>;
}

@injectable()
export class RedisSocketSessionManager implements SocketSessionManager<SocketSessionPayload> {

  private readonly pubClient: Redis;
  private readonly subClient: Redis;

  constructor() {
    this.pubClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    });
    this.subClient = this.pubClient.duplicate();
  }

  async initialize() {
    try {
      logger.info("Connected to Redis SessionManager");
      return {
        pubClient: this.pubClient,
        subClient: this.subClient,
      }
    } catch (e) {
      logger.error("Failed to connect to Redis SessionManager", e);
      throw new Error("Redis connection failed");
    }
  }

  async join(data: SocketSessionPayload): Promise<void> {
    const key = this.buildKey(data.socketId);
    const payload = {...data};
    delete payload.socketId;
    this.pubClient.set(key, JSON.stringify(payload));
  }

  async getSessionData(id: string): Promise<SocketSessionPayload> {
    const key = this.buildKey(id);
    return JSON.parse(await this.pubClient.get(key));
  }

  async leave(id: string): Promise<void> {
    const key = this.buildKey(id);
    await this.pubClient.del(key);
  }

  async disconnect(userId: string): Promise<void> {
    const keys = await this.pubClient.keys(`socket-session:*`);
    for (const key of keys) {
      const payload = await this.pubClient.get(key);
      if (payload) {
        const sessionData: SocketSessionPayload = JSON.parse(payload);
        if (sessionData.userId == userId) {
          this.pubClient.del(key);
        }
      }
    }
  }

  private buildKey(id: string) {
    return `socket-session:${id}`;
  }
}


