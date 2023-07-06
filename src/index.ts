import * as dotenv from "dotenv";
import { LemmyBot } from "lemmy-bot";
import { Configuration } from "./Classes/ValueObjects/Configuration";

dotenv.config();

// initialise the configuration for the bot
const configuration: Configuration = Configuration.createFromEnv();

// initialise the bot
const bot: LemmyBot = new LemmyBot({
  instance: configuration.bot.instance,
  credentials: {
    username: configuration.bot.username,
    password: configuration.bot.password,
  },
  federation: configuration.bot.isLocal ? "local" : "all",
  dbFile: "database.sqlite3",
  handlers: {},
  schedule: [],
});

bot.start();
