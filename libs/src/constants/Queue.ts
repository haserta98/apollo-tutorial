export enum QueueType {
  LOG = "log",
  ORDER = "order",
}

export enum SubQueueType {
  GET_ORDER_BY_USER_ID = "orders.get.by.user_id",
  GET_ORDER_ITEMS_BY_ORDER_ID = "orders.get.items.by.order_id",
  GET_ORDER_BY_ID = "orders.get.by.id",
  CREATE = "orders.create",
}

export const queueWithShard = (queue: QueueType, key: string, shardSize: number): string => {
  const shard = hashString(key ?? "") % shardSize;
  return `${queue}_${shard}`;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}