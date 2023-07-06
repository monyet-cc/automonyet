import { BotActions } from "lemmy-bot";
import { Person } from "lemmy-js-client";
import { Configuration } from "../ValueObjects/Configuration";

export interface HandlesPrivateMessage {
  readonly configuration: Configuration;

  getMatchExpression(): RegExp;

  hasPermission(person: Person): Promise<boolean>;

  handle(message: string, bot: BotActions): Promise<void>;
}
