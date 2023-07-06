import { LemmyBot } from "lemmy-bot";
import * as dotenv from "dotenv";

dotenv.config();
const bot = new LemmyBot({
  instance: process.env.INSTANCE_URL || "my.lemmy.local",
  credentials: {
    username: process.env.BOT_USERNAME || "username",
    password: process.env.BOT_PASSWORD || "password",
  },
});

bot.start();
