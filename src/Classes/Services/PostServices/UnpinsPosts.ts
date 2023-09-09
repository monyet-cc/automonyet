import { CreationAttributes } from "sequelize";
import { provide } from "inversify-binding-decorators";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { PinnedPost } from "../../Database/Models/PinnedPost.js";

@provide(UnpinsPosts)
export class UnpinsPosts {
  constructor(private readonly client: LemmyApi) {}

  public async unpinPosts(
    postsToUnpin: CreationAttributes<PinnedPost>[]
  ): Promise<number[]> {
    const unpinnedPostIds: number[] = [];
    try {
      for (const post of postsToUnpin) {
        await this.client.featurePost(post.id, "Community", false);
        if (post.isLocallyPinned)
          await this.client.featurePost(post.id, "Local", false);
        unpinnedPostIds.push(post.id);
      }
    } catch (error) {
      console.log("Error occurred while attempting to unpin posts");
    }

    return unpinnedPostIds;
  }
}
