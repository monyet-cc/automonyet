import "reflect-metadata";
import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import { LemmyApi } from "../../../Classes/ValueObjects/LemmyApi.js";
import { AutomatesFeaturedPost } from "../../../Classes/Services/AutomatesFeaturedPost.js";
import moment from "moment";
import { PostgresService } from "../../../Classes/Services/PostgresService.js";

describe(AutomatesFeaturedPost, () => {
  it("Creates Daily Thread Post", async () => {
    const expectedPostId = 1;
    const expectedCommunityId = 100;
    const expectedCommunityName = "cafe";
    const postCategory = "Daily Chat Thread";

    const clientMock = mock(LemmyApi);
    const postgresServiceMock = mock(PostgresService);

    when(clientMock.getCommunityIdentifier("cafe")).thenResolve(
      expectedCommunityId
    );

    when(clientMock.createFeaturedPost(anything(), "Community")).thenResolve(
      expectedPostId
    );

    when(
      postgresServiceMock.setPostAutoRemoval(anything(), anything(), anything())
    ).thenResolve();

    const service = new AutomatesFeaturedPost(
      instance(clientMock),
      instance(postgresServiceMock)
    );

    await service.handlePostCreation(postCategory);

    verify(clientMock.getCommunityIdentifier(expectedCommunityName)).once();
    verify(clientMock.createFeaturedPost(anything(), "Community")).once();

    const [communityNameArgument] = capture(
      clientMock.getCommunityIdentifier
    ).last();

    expect(communityNameArgument).toBe(expectedCommunityName);
    const [createFeaturedPostFormArgument, featuredTypeArgument] = capture(
      clientMock.createFeaturedPost
    ).last();

    expect(createFeaturedPostFormArgument).toHaveProperty("name");
    expect(createFeaturedPostFormArgument).toHaveProperty(
      "community_id",
      expectedCommunityId
    );
    expect(createFeaturedPostFormArgument.name).toBe(
      `/c/café daily chat thread for ${moment().format("D MMMM YYYY")}`
    );
    expect(featuredTypeArgument).toBe("Community");
  });
});
