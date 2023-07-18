import {
  CreatePost,
  GetPersonDetailsResponse,
  LemmyHttp,
  Person,
  PostFeatureType,
} from "lemmy-js-client";

export class LemmyApi {
  constructor(
    public readonly client: LemmyHttp,
    public readonly token: string
  ) {}

  async createPost(form: Omit<CreatePost, "auth">): Promise<number> {
    return (await this.client.createPost({ ...form, auth: this.token }))
      .post_view.post.id;
  }

  async createFeaturedPost(
    post: Omit<CreatePost, "auth">,
    featuredType: PostFeatureType
  ): Promise<number> {
    const postIdentifier = await this.createPost(post);

    return this.featurePost(postIdentifier, featuredType, true);
  }

  async featurePost(
    postIdentifier: number,
    featuredType: "Local" | "Community",
    featurePost: boolean
  ): Promise<number> {
    return (
      await this.client.featurePost({
        post_id: postIdentifier,
        featured: featurePost,
        feature_type: featuredType,
        auth: this.token,
      })
    ).post_view.post.id;
  }

  async getDetailsForPerson(person: Person): Promise<GetPersonDetailsResponse> {
    return await this.client.getPersonDetails({
      username: person.name,
      auth: this.token,
    });
  }

  async getCommunityIdentifier(name: string): Promise<number> {
    return (await this.client.getCommunity({ name: name, auth: this.token }))
      .community_view.community.id;
  }
}
