import { LemmyApi } from "../../Classes/ValueObjects/LemmyApi";
import { CreatePost, Person, PostFeatureType } from "lemmy-js-client";
import { mock, when } from "ts-mockito";
import { communityModViewMock, personAggMock } from "./LemmyApiFactoryMockData";

export const LemmyApiMock = (
  form: Omit<CreatePost, "auth">,
  featuredType: PostFeatureType,
  person: Person
): LemmyApi => {
  const mockApi: LemmyApi = mock(LemmyApi);

  // Mock the fetchData method
  when(mockApi.createPost(form)).thenResolve(Math.floor(Math.random() * 101));

  when(mockApi.createFeaturedPost(form, featuredType)).thenResolve(
    Math.floor(Math.random() * 101)
  );

  when(mockApi.getDetailsForPerson(person)).thenResolve({
    person_view: {
      person: person,
      counts: personAggMock,
    },
    comments: [],
    posts: [],
    moderates: [communityModViewMock(person)],
  });

  return mockApi;
};
