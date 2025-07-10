import TypeDef from "../../typedef_interface";
import UserResolver from "../user/user.resolver";
import {OrderEntity, OrderItemEntity} from "@ecommerce/libs/src/entity/order.entity";
import OrderResolver from "./order.resolver";
import {OrderCreateRequest} from "@ecommerce/libs/src/dto/order.dto";
import OrderMutation from "./order.mutation";
import {inject} from "inversify";

class OrderTypeDef implements TypeDef {

  constructor(@inject(OrderResolver) private readonly orderResolver: OrderResolver,
              @inject(UserResolver) private readonly userResolver: UserResolver,
              @inject(OrderMutation) private readonly orderMutation: OrderMutation) {
  }

  getSchema() {
    return {
      query: {
        orders: (_, {userId}) => this.orderResolver.resolveOrders(+userId),
        order: (_, {id}) => this.orderResolver.resolveOrder(+id),
        orderItems: (_, {orderId}) => this.orderResolver.resolveOrderItems(+orderId),
      },
      mutation: {
        createOrder: (_: any, order: OrderCreateRequest) => this.orderMutation.createOrder(_, order)
      },
      otherResolvers: {
        Order: {
          items: (order: OrderEntity) => this.orderResolver.resolveOrderItems(+order.id),
          user: (order: OrderEntity) => this.userResolver.resolveUser(+order.user.id),
        },
        OrderItem: {
          order: (item: OrderItemEntity, args) => {
            return this.orderResolver.resolveOrder(+item.order.id);
          },
        },
      }
    }
  }

  getTypeDefs(): string {
    return `
      type Order {
        id:  ID!        
        items: [OrderItem!]!
        totalPrice: Float!
        status: String!
        user: User!
        createdAt: String!
        updatedAt: String!
        deletedAt: String
      }
      
      type OrderItem {
        id: ID!
        productId: ID!
        productName: String!
        price: Float!
        quantity: Int!
        order: Order!
      }
      
      input OrderItemInput {
        productId: ID!
        productName: String!
        price: Float!
        quantity: Int!
      }
    `
  }

  getResolvers(): string {
    return `
      orders(userId: ID!): [Order!]!
      order(id: ID!): Order
      orderItems(orderId: ID!): [OrderItem!]!
    `
  }

  getMutations(): string {
    return `
      createOrder(userId: ID!, items: [OrderItemInput!]!): Order!
    `
  }

}

export default OrderTypeDef;