import {
  Community,
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

    return (
      await this.client.featurePost({
        post_id: postIdentifier,
        featured: true,
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
}
