import TypeDef from "../../graphql/typedef_interface";

class UserTypeDef implements TypeDef {
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