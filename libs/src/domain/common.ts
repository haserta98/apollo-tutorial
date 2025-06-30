
export interface Message<T> {
  type: string;
  payload: T;
}