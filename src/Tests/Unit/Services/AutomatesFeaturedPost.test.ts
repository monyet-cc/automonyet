import "reflect-metadata";
import {
  anyNumber,
  anything,
  capture,
  instance,
  mock,
  verify,
  when,
} from "ts-mockito";
import { LemmyApi } from "../../../Classes/ValueObjects/LemmyApi.js";
import { AutomatesFeaturedPost } from "../../../Classes/Services/AutomatesFeaturedPost.js";
import moment from "moment";
import { PostgresService } from "../../../Classes/Services/PostgresService.js";
import { OverduePostPin } from "../../../Classes/Services/PostgresService.js";
import { postsToAutomate } from "../../../Classes/ValueObjects/PostsToAutomate.js";

describe(AutomatesFeaturedPost, () => {
  it("Create Post Handling", async () => {
    const expectedPostId = 1;
    const expectedCommunityId = 100;
    const expectedCommunityName = "cafe";
    const post = {
      category: "Daily Chat Thread",
      communityName: "cafe",
      body: undefined,
      pinLocally: true,
      cronExpression: "5 0 4 * * *",
      timezone: "Asia/Kuala_Lumpur",
      daysToPin: 1,
      title: `/c/café daily chat thread for $date`,
      dateFormat: "D MMMM YYYY",
    };

    const clientMock = mock(LemmyApi);
    const postgresServiceMock = mock(PostgresService);

    when(clientMock.getCommunityIdentifier("cafe")).thenResolve(
      expectedCommunityId
    );

    when(clientMock.createFeaturedPost(anything(), "Community")).thenResolve(
      expectedPostId
    );

    when(clientMock.featurePost(anything(), anything(), true)).thenResolve(
      expectedPostId
    );

    when(
      postgresServiceMock.setPostAutoRemoval(anything(), anything(), anything())
    ).thenResolve();

    const service = new AutomatesFeaturedPost(
      instance(clientMock),
      instance(postgresServiceMock)
    );

    await service.handlePostCreation(post);

    verify(clientMock.getCommunityIdentifier(expectedCommunityName)).once();
    verify(clientMock.createFeaturedPost(anything(), "Community")).once();
    verify(clientMock.featurePost(anything(), "Local", true)).once();

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
  it("Remove Post Handling", async () => {
    const clientMock = mock(LemmyApi);
    const postgresServiceMock = mock(PostgresService);

    const service = new AutomatesFeaturedPost(
      instance(clientMock),
      instance(postgresServiceMock)
    );

    const mockedRows: OverduePostPin[] = [
      { postId: 1, isLocallyPinned: true },
      { postId: 2, isLocallyPinned: false },
    ];

    when(postgresServiceMock.handleOverduePins()).thenResolve(mockedRows);

    when(clientMock.featurePost(anything(), anything(), false)).thenResolve(
      anyNumber() //we are not checking this logic here
    );
    await service.removeOverduePins();

    verify(postgresServiceMock.handleOverduePins()).once();
    verify(clientMock.featurePost(anything(), anything(), false)).thrice();
  });
  it("Create Bot Tasks", async () => {
    const clientMock = mock(LemmyApi);
    const postgresServiceMock = mock(PostgresService);

    const service = new AutomatesFeaturedPost(
      instance(clientMock),
      instance(postgresServiceMock)
    );

    const scheduledBotTasks = service.createBotTasks();

    expect(Array.isArray(scheduledBotTasks)).toBe(true);
    expect(scheduledBotTasks.length).toBe(postsToAutomate.length + 1);
  });
  it("Generate Post Title", async () => {
    const dailyThreadTitle = `/c/café daily chat thread for ${moment().format(
      "D MMMM YYYY"
    )}`;
    const dailyFoodThreadTitle = `Daily c/food Thread - Whatcha Having Today? ${moment().format(
      "Do MMMM, YYYY"
    )}`;

    const generatePostTitle = (title: string, dateFormat: string): string => {
      const formattedDate = moment().format(dateFormat);

      // Replace the placeholder "$date" with the formatted date
      return title.replace(/\$date/g, formattedDate);
    };

    const DTpost = postsToAutomate.find(
      (post) => post.category == "Daily Chat Thread"
    );

    const DailyFoodPost = postsToAutomate.find(
      (post) => post.category == "Daily Food Thread"
    );

    if (DTpost !== undefined) {
      expect(generatePostTitle(DTpost?.title, DTpost?.dateFormat)).toBe(
        dailyThreadTitle
      );
    }

    if (DailyFoodPost !== undefined) {
      expect(
        generatePostTitle(DailyFoodPost.title, DailyFoodPost.dateFormat)
      ).toBe(dailyFoodThreadTitle);
    }
  });
});
