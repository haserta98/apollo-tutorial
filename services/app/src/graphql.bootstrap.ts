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

@injectable()
class GraphqlBootstrapper {

  constructor(@inject(UserResolver) private readonly userResolver: UserResolver,
              @inject(UserMutation) private readonly userMutation: UserMutation,
              @inject(OrderResolver) private readonly orderResolver: OrderResolver,
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
          order: (_, {id}) => {
          },
        },
        User: {
          addresses: (user: UserEntity) => this.userResolver.resolveUserAddress(user.id),
        },
        UserAddress: {
          user: (address: UserAddressEntity) => this.userResolver.resolveUser(address.user.id),
        },
        Mutation: {
          createUser: (_: any, user: UserEntity) => this.userMutation.createUser(_, user),
          createAddress: (_: any, address: UserAddressEntity) => this.userMutation.createAddress(_, address),
          removeUser: (_: any, args) => this.userMutation.removeUser(_, +args.id),
          createOrder: (_: any, order: any) => {

          }
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