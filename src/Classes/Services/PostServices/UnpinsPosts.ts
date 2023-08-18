import { provide } from "inversify-binding-decorators";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { OverduePostPin } from "../PostgresServices/PostgresService.js";

@provide(UnpinsPosts)
export class UnpinsPosts {
  constructor(private readonly client: LemmyApi) {}

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
}
