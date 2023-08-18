import { provide } from "inversify-binding-decorators";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { PostgresService } from "../PostgresServices/PostgresService.js";
import { getPost } from "../../ValueObjects/PostsToAutomate.js";
import { UnpinsPosts } from "./UnpinsPosts.js";
import { CreatesPost } from "./CreatesPost.js";

@provide(RenewsPosts)
export class RenewsPosts {
  constructor(
    private readonly client: LemmyApi,
    private readonly dbservice: PostgresService,
    private readonly createsPostService: CreatesPost,
    private readonly unpinsPostservice: UnpinsPosts
  ) {}

  public async renewPosts(postCategory: string): Promise<void> {
    try {
      const currentlyPinnedPosts = await this.dbservice.getCurrentlyPinnedPosts(
        postCategory
      );

      if (currentlyPinnedPosts !== undefined) {
        const unpinnedPostIds = await this.unpinsPostservice.unpinPosts(
          currentlyPinnedPosts
        );
        if (unpinnedPostIds.length > 0)
          await this.dbservice.clearUnpinnedPosts(postCategory);
      }

      await this.createsPostService.handlePostCreation(getPost(postCategory));
    } catch (err) {
      console.log(
        "An error has occured while automating scheduled posts: " + err
      );
    }
  }
}
