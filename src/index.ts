import packages from "lemmy-bot";
import "reflect-metadata";
import { HandlesPrivateMessage } from "./Classes/Handlers/HandlesPrivateMessage.js";
import { CreatesDailyThread } from "./Classes/Handlers/PrivateMessages/CreatesDailyThread.js";
import { SchedulesPostsHandling } from "./Classes/Handlers/PrivateMessages/SchedulesPostsHandling.js";
import { container } from "./Classes/Services/ConfiguresInversify.js";
import { Configuration } from "./Classes/ValueObjects/Configuration.js";
import { SchedulesPosts } from "./Classes/Services/SchedulesPosts.js";
import { PostgresService } from "./Classes/Services/PostgresService.js";

const { LemmyBot } = packages;

const configuration = container.get<Configuration>(Configuration);

// initialise the private message handlers
const privateMessageHandlers: HandlesPrivateMessage[] = [
  container.get<HandlesPrivateMessage>(CreatesDailyThread),
  container.get<HandlesPrivateMessage>(SchedulesPostsHandling),
];

// initialise services
const postSchedulerService: SchedulesPosts = container.get(SchedulesPosts);

// initialise database
await new PostgresService().initDBSchema();

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
    privateMessage: async ({
      messageView: { private_message, creator },
      botActions: { sendPrivateMessage },
    }) => {
      const privateMessage = private_message.content;
      const messageOrigin = creator.name;
      const matchingHandler: HandlesPrivateMessage | undefined =
        privateMessageHandlers.find((value: HandlesPrivateMessage) =>
          value.getMatchExpression().exec(privateMessage)
        );

      if (matchingHandler === undefined) {
        console.info(
          `Received private message ${privateMessage} from ${messageOrigin}, but no handlers were matched`
        );
        sendPrivateMessage({
          recipient_id: creator.id,
          content:
            "Sorry, I do not recognize the command you have entered. Please try again!",
        });
      }

      if (matchingHandler !== undefined) {
        // ensure that the handler's permission requirement is met
        const hasPermission = await matchingHandler.hasPermission(creator);

        if (!hasPermission) {
          console.warn(
            `${messageOrigin} attempted to trigger ${matchingHandler.constructor.name} without the necessary permissions`
          );
          sendPrivateMessage({
            recipient_id: creator.id,
            content:
              "Sorry, you do not have the required permissions to execute this command.",
          });
        }

        if (hasPermission) {
          console.info(
            `Matched handler ${matchingHandler.constructor.name} using "${privateMessage}" from ${messageOrigin}`
          );

          await matchingHandler.handle(privateMessage);

          sendPrivateMessage({
            recipient_id: creator.id,
            content: "Your daily thread post has been created successfully!",
          });
        }
      }
    },
  },
  schedule: postSchedulerService.createBotTasks(),
});

bot.start();
