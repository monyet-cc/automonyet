import { provide } from "inversify-binding-decorators";
import moment from "moment";
import { LemmyApi } from "../ValueObjects/LemmyApi.js";
import { BotTask } from "lemmy-bot";

@provide(AutomatesFeaturedPost)
export class AutomatesFeaturedPost {
  public postsToCreate = [
    {
      category: "Daily Chat Thread",
      communityName: "cafe",
      body: undefined,
      pinLocal: true,
      cronExpression: "0 0 0 * * *",
      timezone: "Asia/Kuala_Lumpur",
    },
  ];

  constructor(private readonly client: LemmyApi) {}

  public generatePostTitle = (category: string): string => {
    switch (category) {
      case "Daily Chat Thread":
        return `/c/café daily chat thread for ${moment().format(
          "D MMMM YYYY"
        )}`;
      default:
        return "";
    }
  };

  public createBotTasks = (): BotTask[] => {
    const botTasks: BotTask[] = [];
    for (const post of this.postsToCreate) {
      botTasks.push({
        cronExpression: post.cronExpression,
        timezone: post.timezone,
        doTask: async () => {
          return this.handlePost(post.category);
        },
      });
    }
    return botTasks;
  };

  public async handlePost(postCategory: string): Promise<void> {
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
    if (matchingPostType.pinLocal) {
      await this.client.featurePost(postIdentifier, "Local", true);
    }

    setTimeout(async () => {
      await this.client.featurePost(postIdentifier, "Local", false);
      await this.client.featurePost(postIdentifier, "Community", false);
    }, 24 * 60 * 60 * 1000); // 1 day in milliseconds
  }
}
