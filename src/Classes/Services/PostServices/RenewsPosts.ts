import { provide } from "inversify-binding-decorators";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { OverduePostPin, PostgresService } from "../PostgresService.js";
import {
  postsToAutomate,
  PostToCreate,
} from "../../ValueObjects/PostsToAutomate.js";
import { CreatesPost } from "./CreatesPost.js";

@provide(RenewsPosts)
export class RenewsPosts {
  constructor(
    private readonly client: LemmyApi,
    private readonly dbservice: PostgresService,
    private readonly createsPostService: CreatesPost
  ) {}

  private getPost(postCategory: string): PostToCreate {
    const post = postsToAutomate.find((p) => p.category === postCategory)!;
    return post;
  }

  public async unpinPosts(postsToUnpin: OverduePostPin[]): Promise<number[]> {
    const unpinnedPostIds: number[] = [];
    for (const post of postsToUnpin) {
      await this.client.featurePost(post.postId, "Community", false);
      if (post.isLocallyPinned)
        await this.client.featurePost(post.postId, "Local", false);
      unpinnedPostIds.push(post.postId);
    }

    return unpinnedPostIds;
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

      await this.createsPostService.handlePostCreation(
        this.getPost(postCategory)
      );
    } catch (err) {
      console.log(
        "An error has occured while automating scheduled posts: " + err
      );
    }
  }
}
export { CreatesPost };
