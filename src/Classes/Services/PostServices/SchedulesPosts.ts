import { provide } from "inversify-binding-decorators";
import { BotTask } from "lemmy-bot";
import { PostgresService } from "../PostgresServices/PostgresService.js";
import { RenewsPosts } from "./RenewsPosts.js";
import {
  getNextScheduledTime,
  getPostsToSchedule,
} from "../../ValueObjects/PostsToAutomate.js";
import { TaskSchedules } from "../../Database/Repositories/TaskSchedules.js";
import { TaskSchedule } from "../../Database/Models/TaskSchedule.js";
import { CreationAttributes } from "sequelize";

@provide(SchedulesPosts)
export class SchedulesPosts {
  constructor(
    private readonly dbservice: PostgresService,
    private readonly taskScheduleService: TaskSchedules,
    private readonly renewPostService: RenewsPosts
  ) {}

  private async initPostScheduleTasks(): Promise<void> {
    const postCategories =
      await this.taskScheduleService.getCategoriesByTaskType("postsToAutomate");
    const postsToSchedule = getPostsToSchedule(postCategories);
    if (postsToSchedule !== undefined) {
      for (const post of postsToSchedule) {
        const params: CreationAttributes<TaskSchedule> = {
          category: post.category,
          nextScheduledTime: getNextScheduledTime(post.category),
          taskType: "postsToAutomate",
        };
        await TaskSchedule.create(params);
      }
    }
  }

  public async createBotTasks(): Promise<BotTask[]> {
    await this.initPostScheduleTasks();
    const botTasks: BotTask[] = [];
    botTasks.push({
      cronExpression: "0 5 * * * *",
      timezone: "Asia/Kuala_Lumpur",
      doTask: async () => {
        return this.handlePostSchedule();
      },
    });
    return botTasks;
  }

  public async handlePostSchedule(): Promise<void> {
    try {
      const postsToSchedule = await this.dbservice.getScheduledTasks(
        "postsToAutomate"
      );

      if (postsToSchedule !== undefined) {
        for (const post of postsToSchedule) {
          this.renewPostService.renewPosts(post.category);

          await this.dbservice.updatePostTaskSchedule(
            getNextScheduledTime(post.category),
            post.category
          );
        }
      }
    } catch (err) {
      console.log("An error has occured while scheduling posts: " + err);
    }
  }
}
