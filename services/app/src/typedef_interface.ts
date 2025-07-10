interface TypeDef {
  getTypeDefs(): string;

  getResolvers(): string;

  getMutations(): string;

  getSchema(): TypeDefSchema;
}

export type TypeDefSchema = {
  query: Record<string, any>,
  mutation: Record<string, any>,
  otherResolvers: Record<string, any>
}

export default TypeDef;