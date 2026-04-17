export interface ChatProvider {
  readonly name: string;
  send(message: string): Promise<void>;
}
