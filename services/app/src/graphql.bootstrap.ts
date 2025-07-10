import {ApolloServer} from "@apollo/server";
import {generateSchema} from "./typedef";
import {startStandaloneServer} from "@apollo/server/standalone";
import TypeDef from "./typedef_interface";
import {inject, injectable} from "inversify";
import {logger} from "@ecommerce/libs/src/logger";
import UserTypeDef from "./modules/user/user.typedef";
import OrderTypeDef from "./modules/order/order.typedef";

@injectable()
class GraphqlBootstrapper {

  constructor(@inject(UserTypeDef) private readonly userTypeDef: UserTypeDef,
              @inject(OrderTypeDef) private readonly orderTypeDef: OrderTypeDef) {
  }

  public async initialize() {

    const types: TypeDef[] = [
      this.userTypeDef,
      this.orderTypeDef
    ];
    const server = new ApolloServer({
      typeDefs: generateSchema(types),
      resolvers: {
        Query: {
          ...types.reduce((prev, curr) => {
            return {...prev, ...curr.getSchema().query};
          }, {}),
        },
        ...types.reduce((prev, curr) => {
          return {...prev, ...curr.getSchema().otherResolvers};
        }, {}),
        Mutation: {
          ...types.reduce((prev, curr) => {
            return {...prev, ...curr.getSchema().mutation};
          }, {}),
        },
      }
    });
    const {url} = await startStandaloneServer(server, {
      listen: {port: process.env.GRAPHQL_PORT ? +process.env.GRAPHQL_PORT : 4000},
    });
    logger.info(`GraphQL Server is running at ${url}`);
  }
}

export default GraphqlBootstrapper;