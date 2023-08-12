import { provide } from "inversify-binding-decorators";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { BotTask } from "lemmy-bot";
import { PostgresService, TaskSchedule } from "../PostgresService.js";
import { RenewsPosts } from "./RenewsPosts.js";
import { postsToAutomate } from "../../ValueObjects/PostsToAutomate.js";
import pkg from "cron-parser";
const parseExpression = pkg.parseExpression;

@provide(SchedulesPosts)
export class SchedulesPosts {
  constructor(
    private readonly client: LemmyApi,
    private readonly dbservice: PostgresService,
    private readonly renewPostService: RenewsPosts
  ) {}

  private getCronExpression(postCategory: string): string {
    const post = postsToAutomate.find((p) => p.category === postCategory)!;
    return post.cronExpression;
  }

  private getNextScheduledTime(postCategory: string): Date {
    const cronExpression = this.getCronExpression(postCategory);

    const interval = parseExpression(cronExpression);
    return new Date(interval.next().toString());
  }

  public createBotTasks = (): BotTask[] => {
    const botTasks: BotTask[] = [];
    botTasks.push({
      cronExpression: "0 5 * * * *",
      timezone: "Asia/Kuala_Lumpur",
      doTask: async () => {
        return this.handlePostSchedule();
      },
    });
    return botTasks;
  };

  public async handlePostSchedule(): Promise<void> {
    try {
      const postsToSchedule: TaskSchedule[] | undefined =
        await this.dbservice.getScheduledTasks("postsToAutomate");

      if (postsToSchedule !== undefined) {
        for (const post of postsToSchedule) {
          this.renewPostService.renewPosts(post.category);

          await this.dbservice.updateTaskSchedule(
            this.getNextScheduledTime(post.category),
            post.category
          );
        }
      }
    } catch (err) {
      console.log("An error has occured while scheduling posts: " + err);
    }
  }
}
