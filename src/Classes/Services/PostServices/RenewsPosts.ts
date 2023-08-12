import { provide } from "inversify-binding-decorators";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { OverduePostPin, PostgresService } from "../PostgresService.js";
import {
  postsToAutomate,
  PostToCreate,
} from "../../ValueObjects/PostsToAutomate.js";
import { CreatesPost, UnpinsPosts } from "./PostService.js";

@provide(RenewsPosts)
export class RenewsPosts {
  constructor(
    private readonly client: LemmyApi,
    private readonly dbservice: PostgresService,
    private readonly createsPostService: CreatesPost,
    private readonly unpinsPostservice: UnpinsPosts
  ) {}

  private getPost(postCategory: string): PostToCreate {
    const post = postsToAutomate.find((p) => p.category === postCategory)!;
    return post;
  }

  public async renewPosts(postCategory: string): Promise<void> {
    try {
      const currentlyPinnedPosts = await this.dbservice.getOverduePosts(
        postCategory
      );

      if (currentlyPinnedPosts !== undefined) {
        const unpinnedPostIds = await this.unpinsPostservice.unpinPosts(
          currentlyPinnedPosts
        );
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
