import { LemmyApi } from "../../Classes/ValueObjects/LemmyApi.js";
import { CreatePost, Person, PostFeatureType } from "lemmy-js-client";
import { mock, when, instance } from "ts-mockito";
import { communityModViewMock, personAggMock } from "./MockData.js";

export class LemmyApiMock extends LemmyApi {
  override async createPost(form: Omit<CreatePost, "auth">): Promise<number> {
    return Math.floor(Math.random() * 101);
  }

  override async createFeaturedPost(
    form: Omit<CreatePost, "auth">,
    featuredType: PostFeatureType
  ): Promise<number> {
    return Math.floor(Math.random() * 101);
  }

  override async getDetailsForPerson(person: Person): Promise<any> {
    return {
      person_view: {
        person: person,
        counts: personAggMock,
      },
      comments: [],
      posts: [],
      moderates: [communityModViewMock(person)],
    };
  }
}
