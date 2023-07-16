import moment from "moment";
import "reflect-metadata";
import {
  anyString,
  anything,
  capture,
  instance,
  mock,
  verify,
  when,
} from "ts-mockito";
import { CreatesDailyThread } from "../../../../Classes/Handlers/PrivateMessages/CreatesDailyThread.js";
import { DeterminesIfUserModeratesCommunity } from "../../../../Classes/Services/DeterminesIfUserModeratesCommunity.js";
import { LemmyApi } from "../../../../Classes/ValueObjects/LemmyApi.js";

describe(CreatesDailyThread, () => {
  const DTTestCases = (() => {
    return [
      {
        jokeInput: `automod daily joke: Test joke here`,
        expectedJoke: "Test joke here",
      },
      {
        jokeInput: `automod daily joke Test joke here`,
        expectedJoke: "Test joke here",
      },
      {
        jokeInput: `automod daily joke:`,
        expectedJoke:
          "knock knock, who's there, no one, no one? because no one put a joke here",
      },
      {
        jokeInput: `automod daily joke: `,
        expectedJoke:
          "knock knock, who's there, no one, no one? because no one put a joke here",
      },
      {
        jokeInput: `automod daily joke`,
        expectedJoke:
          "knock knock, who's there, no one, no one? because no one put a joke here",
      },
      {
        jokeInput: `automod daily joke `,
        expectedJoke:
          "knock knock, who's there, no one, no one? because no one put a joke here",
      },
    ];
  })();

  const expectedPostId = 1;
  const expectedCommunityId = 100;
  const expectedCommunityName = "cafe";

  describe.each(DTTestCases)("Creates Daily Thread", (testCase) => {
    it("creates daily thread based on joke input given", async () => {
      const clientMock = mock(LemmyApi);
      const determinesIfUserModeratesCommunityMock = mock(
        DeterminesIfUserModeratesCommunity
      );

      when(clientMock.createFeaturedPost(anything(), "Local")).thenResolve(
        expectedPostId
      );

      when(
        clientMock.getCommunityIdentifier(expectedCommunityName)
      ).thenResolve(expectedCommunityId);

      when(
        determinesIfUserModeratesCommunityMock.handle(
          anything(),
          expectedCommunityName
        )
      ).thenResolve(true);

      const handler = new CreatesDailyThread(
        instance(clientMock),
        instance(determinesIfUserModeratesCommunityMock)
      );

      await handler.handle(testCase.jokeInput);

      verify(clientMock.getCommunityIdentifier(expectedCommunityName)).once();
      verify(clientMock.createFeaturedPost(anything(), anyString())).once();

      // the permission service class is not called when the handle method is called
      verify(
        determinesIfUserModeratesCommunityMock.handle(
          anything(),
          expectedCommunityName
        )
      ).never();

      const [communityNameArgument] = capture(
        clientMock.getCommunityIdentifier
      ).last();

      expect(communityNameArgument).toBe(expectedCommunityName);

      const [createFeaturedPostFormArgument, featuredTypeArgument] = capture(
        clientMock.createFeaturedPost
      ).last();

      expect(createFeaturedPostFormArgument).toHaveProperty("name");
      expect(createFeaturedPostFormArgument).toHaveProperty("body");
      expect(createFeaturedPostFormArgument).toHaveProperty(
        "community_id",
        expectedCommunityId
      );
      expect(createFeaturedPostFormArgument.name).toBe(
        `/c/café daily chat thread for ${moment().format("D MMMM YYYY")}`
      );
      expect(createFeaturedPostFormArgument.body).toInclude("Joke of the day:");
      expect(createFeaturedPostFormArgument.body).toInclude(
        testCase.expectedJoke
      );
      expect(featuredTypeArgument).toBe("Local");
    });
  });
});
