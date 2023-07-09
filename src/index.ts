import packages from "lemmy-bot";
import "reflect-metadata";
import { HandlesPrivateMessage } from "./Classes/Handlers/HandlesPrivateMessage.js";
import { CreatesDailyThread } from "./Classes/Handlers/PrivateMessages/CreatesDailyThread.js";
import { container } from "./Classes/Services/ConfiguresInversify.js";
import { Configuration } from "./Classes/ValueObjects/Configuration.js";

const { LemmyBot } = packages;

const configuration = container.get<Configuration>(Configuration);

// initialise the private message handlers
const privateMessageHandlers: HandlesPrivateMessage[] = [
  container.get<HandlesPrivateMessage>(CreatesDailyThread),
];

// initialise the bot
const bot: packages.LemmyBot = new LemmyBot({
  instance: configuration.bot.instance,
  credentials: {
    username: configuration.bot.username,
    password: configuration.bot.password,
  },
  federation: configuration.bot.isLocal ? "local" : "all",
  dbFile: "database.sqlite3",
  handlers: {
    privateMessage: async (bot) => {
      const privateMessage = bot.messageView.private_message.content;
      const messageOrigin = bot.messageView.creator.name;
      const matchingHandler: HandlesPrivateMessage | undefined =
        privateMessageHandlers.find((value: HandlesPrivateMessage) =>
          value.getMatchExpression().exec(privateMessage)
        );

      if (matchingHandler === undefined) {
        console.info(
          `Received private message ${privateMessage} from ${messageOrigin}, but no handlers were matched`
        );
      }

      if (matchingHandler !== undefined) {
        // ensure that the handler's permission requirement is met
        const hasPermission = await matchingHandler.hasPermission(
          bot.messageView.creator
        );

        if (!hasPermission) {
          console.warn(
            `${messageOrigin} attempted to trigger ${matchingHandler.constructor.name} without the necessary permissions`
          );
        }

        if (hasPermission) {
          console.info(
            `Matched handler ${matchingHandler.constructor.name} using "${privateMessage}" from ${messageOrigin}`
          );

          await matchingHandler.handle(privateMessage);
        }
      }
    },
  },
  schedule: [],
});

bot.start();
