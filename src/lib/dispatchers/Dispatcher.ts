/**
 * Base interface for all dispatcher
 * implementations.
 */
export default interface Dispatcher {
  send(input: any): Promise<void>;
}
