import { provide } from "inversify-binding-decorators";
import moment from "moment";
import { LemmyApi } from "../ValueObjects/LemmyApi.js";
import { BotTask } from "lemmy-bot";
import { PostgresService } from "./PostgresService.js";

@provide(AutomatesFeaturedPost)
export class AutomatesFeaturedPost {
  private postsToCreate = [
    {
      category: "Daily Chat Thread",
      communityName: "cafe",
      body: undefined,
      pinLocally: true,
      cronExpression: "5 0 0 * * *",
      timezone: "Asia/Kuala_Lumpur",
      daysToPin: 1,
    },
  ];

  constructor(
    private readonly client: LemmyApi,
    private readonly dbservice: PostgresService
  ) {}

  private generatePostTitle = (category: string): string => {
    switch (category) {
      case "Daily Chat Thread":
        return `/c/café daily chat thread for ${moment().format(
          "D MMMM YYYY"
        )}`;
      default:
        return "";
    }
  };

  public getPostsToCreate() {
    return this.postsToCreate;
  }

  public createBotTasks = (): BotTask[] => {
    const botTasks: BotTask[] = [];
    for (const post of this.postsToCreate) {
      botTasks.push({
        cronExpression: post.cronExpression,
        timezone: post.timezone,
        doTask: async () => {
          return this.handlePostCreation(post.category);
        },
      });
    }
    botTasks.push({
      cronExpression: "0 0 0 * * *",
      timezone: "Asia/Kuala_Lumpur",
      doTask: async () => {
        return this.removeOverduePins();
      },
    });
    return botTasks;
  };

  public async handlePostCreation(postCategory: string): Promise<void> {
    const matchingPostType = this.postsToCreate.find((post) => {
      return post.category === postCategory;
    });

    if (matchingPostType === undefined) {
      console.warn("No matching post type found");
      return;
    }
    const communityIdentifier = await this.client.getCommunityIdentifier(
      matchingPostType.communityName
    );

    const postIdentifier: number = await this.client.createFeaturedPost(
      {
        name: this.generatePostTitle(postCategory),
        community_id: communityIdentifier,
        body: undefined,
      },
      "Community"
    );
    if (matchingPostType.pinLocally) {
      await this.client.featurePost(postIdentifier, "Local", true);
    }

    //save postId in db
    if (matchingPostType.daysToPin > 0) {
      await this.dbservice.setPostAutoRemoval(
        postIdentifier,
        matchingPostType.daysToPin,
        matchingPostType.pinLocally
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
