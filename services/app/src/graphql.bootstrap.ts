import {ApolloServer} from "@apollo/server";
import {generateSchema} from "./typedef";
import {startStandaloneServer} from "@apollo/server/standalone";
import TypeDef from "./typedef_interface";
import {inject, injectable} from "inversify";
import UserMutation from "./modules/user/user.mutation";
import UserResolver from "./modules/user/user.resolver";
import UserTypeDef from "./modules/user/user.typedef";
import {UserEntity} from "@ecommerce/libs/src/entity/user.entity";
import {UserAddressEntity} from "@ecommerce/libs/src/entity/user-address.entity";
import {logger} from "@ecommerce/libs/src/logger";
import OrderTypeDef from "./modules/order/order.typedef";
import OrderResolver from "./modules/order/order.resolver";
import {OrderEntity, OrderItemEntity} from "@ecommerce/libs/src/entity/order";
import {OrderCreateRequest} from "@ecommerce/libs/src/dto/order.dto";
import OrderMutation from "./modules/order/order.mutation";

@injectable()
class GraphqlBootstrapper {

  constructor(@inject(UserResolver) private readonly userResolver: UserResolver,
              @inject(UserMutation) private readonly userMutation: UserMutation,
              @inject(OrderResolver) private readonly orderResolver: OrderResolver,
              @inject(OrderMutation) private readonly orderMutation: OrderMutation
  ) {
  }

  public async initialize() {

    const types: TypeDef[] = [
      new UserTypeDef(),
      new OrderTypeDef()
    ]

    const server = new ApolloServer({
      typeDefs: generateSchema(types),
      resolvers: {
        Query: {
          users: () => this.userResolver.resolveUsers(),
          user: (_, {id}) => this.userResolver.resolveUser(+id),
          orders: (_, {userId}) => this.orderResolver.resolveOrders(+userId),
          order: (_, {id}) => this.orderResolver.resolveOrder(+id),
          orderItems: (_, {orderId}) => this.orderResolver.resolveOrderItems(+orderId),
        },
        User: {
          addresses: (user: UserEntity) => this.userResolver.resolveUserAddress(user.id),
        },
        UserAddress: {
          user: (address: UserAddressEntity) => this.userResolver.resolveUser(address.user.id),
        },
        Order: {
          items: (order: OrderEntity) => this.orderResolver.resolveOrderItems(+order.id),
          user: (order: OrderEntity) => this.userResolver.resolveUser(+order.user.id),
        },
        OrderItem: {
          order: (item: OrderItemEntity, args) => {
            return this.orderResolver.resolveOrder(+item.order.id);
          },
        },
        Mutation: {
          createUser: (_: any, user: UserEntity) => this.userMutation.createUser(_, user),
          createAddress: (_: any, address: UserAddressEntity) => this.userMutation.createAddress(_, address),
          removeUser: (_: any, args) => this.userMutation.removeUser(_, +args.id),
          createOrder: (_: any, order: OrderCreateRequest) => this.orderMutation.createOrder(_, order)
        }
      }
    });
    const {url} = await startStandaloneServer(server, {
      listen: {port: process.env.GRAPHQL_PORT ? +process.env.GRAPHQL_PORT : 4000},
    });
    logger.info(`GraphQL Server is running at ${url}`);
  }
}

export default GraphqlBootstrapper;