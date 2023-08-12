import { provide } from "inversify-binding-decorators";
import moment from "moment";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { PostgresService } from "../PostgresService.js";
import { PostToCreate } from "../../ValueObjects/PostsToAutomate.js";
import { OverduePostPin } from "../PostgresService.js";

@provide(CreatesPost)
export class CreatesPost {
  constructor(
    private readonly client: LemmyApi,
    private readonly dbservice: PostgresService
  ) {}

  private generatePostTitle = (title: string, dateFormat: string): string => {
    const formattedDate = moment().format(dateFormat);
    return title.replace(/\$date/g, formattedDate);
  };

  public async handlePostCreation(post: PostToCreate): Promise<void> {
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
}

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
