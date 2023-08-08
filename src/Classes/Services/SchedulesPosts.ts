import { provide } from "inversify-binding-decorators";
import moment from "moment";
import { LemmyApi } from "../ValueObjects/LemmyApi.js";
import { BotTask } from "lemmy-bot";
import {
  OverduePostPin,
  PostgresService,
  TaskSchedule,
} from "./PostgresService.js";
import {
  postsToAutomate,
  PostToAutomate,
} from "../ValueObjects/PostsToAutomate.js";
import { parseExpression } from "cron-parser";

@provide(SchedulesPosts)
export class SchedulesPosts {
  constructor(
    private readonly client: LemmyApi,
    private readonly dbservice: PostgresService
  ) {}

  private generatePostTitle = (title: string, dateFormat: string): string => {
    const formattedDate = moment().format(dateFormat);
    return title.replace(/\$date/g, formattedDate);
  };

  private async handlePostCreation(post: PostToAutomate): Promise<void> {
    const communityIdentifier = await this.client.getCommunityIdentifier(
      post.communityName
    );

    const postIdentifier: number = await this.client.createFeaturedPost(
      {
        name: this.generatePostTitle(post.title, post.dateFormat),
        community_id: communityIdentifier,
        body: post.body,
      },
      "Community"
    );
    if (post.pinLocally) {
      await this.client.featurePost(postIdentifier, "Local", true);
    }

    //save postId in db
    if (post.daysToPin > 0) {
      await this.dbservice.setPostAutoRemoval(
        postIdentifier,
        post.category,
        post.pinLocally
      );
    }
  }

  private async unpinPosts(postsToUnpin: OverduePostPin[]): Promise<number[]> {
    const unpinnedPostIds: number[] = [];
    for (const post of postsToUnpin) {
      await this.client.featurePost(post.postId, "Community", false);
      if (post.isLocallyPinned)
        await this.client.featurePost(post.postId, "Local", false);
      unpinnedPostIds.push(post.postId);
    }

    return unpinnedPostIds;
  }

  private getPost(postCategory: string): PostToAutomate {
    const post = postsToAutomate.find((p) => p.category === postCategory)!;
    return post;
  }

  private getCronExpression(postCategory: string): string {
    const post = postsToAutomate.find((p) => p.category === postCategory)!;
    return post.category;
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
          const currentlyPinnedPosts = await this.dbservice.getOverduePosts(
            post.category
          );

          if (currentlyPinnedPosts !== undefined) {
            const unpinnedPostIds = await this.unpinPosts(currentlyPinnedPosts);
            await this.dbservice.clearUnpinnedPosts(unpinnedPostIds);
          }

          await this.handlePostCreation(this.getPost(post.category));

          const cronExpression = this.getCronExpression(post.category);

          const interval = parseExpression(cronExpression);
          const nextScheduledTime = new Date(interval.next().toString());

          await this.dbservice.updateTaskSchedule(
            nextScheduledTime,
            post.category
          );
        }
      }
    } catch (err) {
      console.log("An error has occured while scheduling posts: " + err);
    }
  }
}
