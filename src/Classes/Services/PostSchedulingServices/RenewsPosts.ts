import { provide } from "inversify-binding-decorators";
import moment from "moment";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { OverduePostPin, PostgresService } from "../PostgresService.js";
import {
  postsToAutomate,
  PostToAutomate,
} from "../../ValueObjects/PostsToAutomate.js";

@provide(RenewsPosts)
export class RenewsPosts {
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

  public async renewPosts(postCategory: string): Promise<void> {
    try {
      const currentlyPinnedPosts = await this.dbservice.getOverduePosts(
        postCategory
      );

      if (currentlyPinnedPosts !== undefined) {
        const unpinnedPostIds = await this.unpinPosts(currentlyPinnedPosts);
        await this.dbservice.clearUnpinnedPosts(unpinnedPostIds);
      }

      await this.handlePostCreation(this.getPost(postCategory));
    } catch (err) {
      console.log(
        "An error has occured while automating scheduled posts: " + err
      );
    }
  }
}
