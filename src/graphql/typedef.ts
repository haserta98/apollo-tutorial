import {gql} from "apollo-server";
import TypeDef from "./typedef_interface";

export const generateSchema = (types: TypeDef[]) => {

  return gql`

  #Schema
  ${types.map(type => type.getTypeDefs()).join('\n')}
  
  #Type
  type Query{
    ${types.map(type => type.getResolvers()).join('\n')}
  }
  
  #Mutation
  type Mutation {
    ${types.map(type => type.getMutations()).join('\n')}
  }
`
};

