import TypeDef from "../../typedef_interface";
import UserResolver from "./user.resolver";
import {UserEntity,UserAddressEntity} from "@ecommerce/libs/src/entity/user.entity";

import UserMutation from "./user.mutation";
import {inject} from "inversify";

class UserTypeDef implements TypeDef {

  constructor(@inject(UserResolver) private readonly userResolver: UserResolver,
              @inject(UserMutation) private readonly userMutation: UserMutation) {
  }

  getSchema() {
    return {
      query: {
        users: () => this.userResolver.resolveUsers(),
        user: (_, {id}) => this.userResolver.resolveUser(+id),
      },
      otherResolvers: {
        User: {
          addresses: (user: UserEntity) => this.userResolver.resolveUserAddress(user.id),
        },
        UserAddress: {
          user: (address: UserAddressEntity) => this.userResolver.resolveUser(address.user.id),
        }
      },
      mutation: {
        createUser: (_: any, user: UserEntity) => this.userMutation.createUser(_, user),
        createAddress: (_: any, address: UserAddressEntity) => this.userMutation.createAddress(_, address),
        removeUser: (_: any, args) => this.userMutation.removeUser(_, +args.id),
      }
    }
  }

  getTypeDefs(): string {
    return `
        type User {
          id: ID!
          username: String!
          firstName: String!
          lastName: String!
          createdAt: String!
          updatedAt: String!
          deletedAt: String
          addresses: [UserAddress!]!
        }
        
        type UserAddress {
          id: ID!
          user: User!
          street: String!
          city: String!
          houseNumber: String!
          postalCode: String
          additionalInfo: String
          isActive: Boolean!
          createdAt: String!
          updatedAt: String!
          deletedAt: String
        }
`;
  }

  getResolvers(): string {
    return `
          users: [User!]!
          user(id: ID!): User
          userAddress(id: ID!): UserAddress
    `;
  }

  getMutations(): string {
    return `
          createUser(username: String!, firstName: String!, lastName: String!): User!
          createAddress(userId: ID!, street: String!, city: String!, houseNumber: String!, postalCode: String, additionalInfo: String): UserAddress!
          removeUser(id: ID!): Boolean!
  `;
  }
}

export default UserTypeDef