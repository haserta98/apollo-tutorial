import TypeDef from "../../typedef_interface";

class OrderTypeDef implements TypeDef {

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