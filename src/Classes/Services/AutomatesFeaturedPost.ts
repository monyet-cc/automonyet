import { provide } from "inversify-binding-decorators";
import moment from "moment";
import { LemmyApi } from "../ValueObjects/LemmyApi.js";
import { BotTask } from "lemmy-bot";
import { PostgresService } from "./PostgresService.js";
import {
  postsToAutomate,
  PostToAutomate,
} from "../ValueObjects/PostsToAutomate.js";

@provide(AutomatesFeaturedPost)
export class AutomatesFeaturedPost {
  constructor(
    private readonly client: LemmyApi,
    private readonly dbservice: PostgresService
  ) {}

  private generatePostTitle = (title: string, dateFormat: string): string => {
    const formattedDate = moment().format(dateFormat);
    return title.replace(/\$date/g, formattedDate);
  };

  public createBotTasks = (): BotTask[] => {
    const botTasks: BotTask[] = [];
    for (const post of postsToAutomate) {
      botTasks.push({
        cronExpression: post.cronExpression,
        timezone: post.timezone,
        doTask: async () => {
          return this.handlePostCreation(post);
        },
      });
    }
    botTasks.push({
      cronExpression: "0 0 4 * * *",
      timezone: "Asia/Kuala_Lumpur",
      doTask: async () => {
        return this.removeOverduePins();
      },
    });
    return botTasks;
  };

  public async handlePostCreation(post: PostToAutomate): Promise<void> {
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
        post.daysToPin,
        post.pinLocally
      );
    }
  }

  public async removeOverduePins(): Promise<void> {
    const postsToUnpin = await this.dbservice.handleOverduePins();
    if (postsToUnpin !== undefined) {
      for (const post of postsToUnpin) {
        this.client.featurePost(post.postId, "Community", false);
        if (post.isLocallyPinned)
          this.client.featurePost(post.postId, "Local", false);
      }
    }
  }
}
