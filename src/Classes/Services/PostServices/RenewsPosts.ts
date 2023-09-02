import { provide } from "inversify-binding-decorators";
import { getPost } from "../../ValueObjects/PostsToAutomate.js";
import { UnpinsPosts } from "./UnpinsPosts.js";
import { CreatesPost } from "./CreatesPost.js";
import { PinnedPosts } from "../../Database/Repositories/PinnedPosts.js";

@provide(RenewsPosts)
export class RenewsPosts {
  constructor(
    private readonly pinnedPostRepository: PinnedPosts,
    private readonly createsPostService: CreatesPost,
    private readonly unpinsPostservice: UnpinsPosts
  ) {}

  public async renewPosts(postCategory: string): Promise<void> {
    try {
      const currentlyPinnedPosts =
        await this.pinnedPostRepository.getByCategory(postCategory);

      if (currentlyPinnedPosts !== undefined) {
        const unpinnedPostIds = await this.unpinsPostservice.unpinPosts(
          currentlyPinnedPosts
        );
        if (unpinnedPostIds.length > 0)
          await this.pinnedPostRepository.removeByCategory(postCategory);
      }

      await this.createsPostService.handlePostCreation(getPost(postCategory));
    } catch (err) {
      console.log(
        "An error has occured while automating scheduled posts: " + err
      );
    }
  }
}
