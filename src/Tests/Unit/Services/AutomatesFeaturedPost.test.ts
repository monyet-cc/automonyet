import "reflect-metadata";
import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import { LemmyApi } from "../../../Classes/ValueObjects/LemmyApi.js";
import { AutomatesFeaturedPost } from "../../../Classes/Services/AutomatesFeaturedPost.js";
import { type } from "os";
import { BotTask } from "lemmy-bot";

describe(AutomatesFeaturedPost, () => {
  it("Creates Daily Thread Post", async () => {
    const expectedPostId = 1;
    const expectedCommunityId = 100;
    const expectedCommunityName = "cafe";
    const postCategory = "Daily Chat Thread";

    const clientMock = mock(LemmyApi);

    when(clientMock.getCommunityIdentifier("cafe")).thenResolve(
      expectedCommunityId
    );

    when(clientMock.createFeaturedPost(anything(), "Community")).thenResolve(
      expectedPostId
    );

    const service = new AutomatesFeaturedPost(instance(clientMock));

    await service.handlePost(postCategory);

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
      service.generatePostTitle(postCategory)
    );
    expect(featuredTypeArgument).toBe("Community");
  });
});
