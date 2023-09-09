import { provide } from "inversify-binding-decorators";
import moment from "moment";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { PostToCreate } from "../../ValueObjects/PostsToAutomate.js";
import { PinnedPosts } from "../../Database/Repositories/PinnedPosts.js";
import { CreationAttributes } from "sequelize";
import { PinnedPost } from "../../Database/Models/PinnedPost.js";

@provide(CreatesPost)
export class CreatesPost {
  constructor(
    private readonly client: LemmyApi,
    private readonly pinnedPostRepository: PinnedPosts
  ) {}

  private generatePostTitle = (title: string, dateFormat: string): string => {
    const formattedDate = moment().format(dateFormat);
    return title.replace(/\$date/g, formattedDate);
  };

  public async handlePostCreation(post: PostToCreate): Promise<void> {
    try {
      const communityIdentifier = await this.client.getCommunityIdentifier(
        post.communityName
      );

      const postIdentifier: number = await this.client.createFeaturedPost(
        {
          name: this.generatePostTitle(post.title, post.dateFormat),
          community_id: communityIdentifier,
          body: post.body === null ? undefined : post.body,
        },
        "Community"
      );
      if (post.pinLocally) {
        await this.client.featurePost(postIdentifier, "Local", true);
      }

      const pinnedPost: CreationAttributes<PinnedPost> = {
        id: postIdentifier,
        category: post.category,
        isLocallyPinned: post.pinLocally,
      };

      //save postId in db
      await this.pinnedPostRepository.create(pinnedPost);
    } catch (err) {
      console.log(
        `An error has occured while trying to create the post: ${post.category} in community ${post.communityName}`,
        err
      );
    }
  }
}
