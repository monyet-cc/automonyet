import { Person } from "lemmy-js-client";

export interface HandlesPrivateMessage {
  getMatchExpression(): RegExp;

  hasPermission(person: Person): Promise<boolean>;

  handle(message: string): Promise<void>;
}
