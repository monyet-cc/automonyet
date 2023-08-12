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
import moment from "moment";
import { PostgresService } from "../../../Classes/Services/PostgresService.js";
import { OverduePostPin } from "../../../Classes/Services/PostgresService.js";
import {
  CreatesPost,
  RenewsPosts,
} from "../../../Classes/Services/PostServices/RenewsPosts.js";
import { SchedulesPosts } from "./../../../Classes/Services/PostServices/SchedulesPosts.js";

describe(CreatesPost, () => {
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

    const service = new CreatesPost(
      instance(clientMock),
      instance(postgresServiceMock)
    );

    await service.handlePostCreation(post);

    verify(clientMock.getCommunityIdentifier(expectedCommunityName)).once();
    verify(clientMock.createFeaturedPost(anything(), "Community")).once();
    verify(clientMock.featurePost(anything(), "Local", true)).once();
    verify(
      postgresServiceMock.setPostAutoRemoval(anything(), anything(), anything())
    ).once();

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

describe(RenewsPosts, () => {
  it("Get Currently Pinned Posts", async () => {
    try {
      const clientMock = mock(LemmyApi);
      const dbMock = mock(PostgresService);

      const currentlyPinnedPosts: OverduePostPin[] = [
        { postId: 0, isLocallyPinned: true },
      ];

      const getOverduePostsSpy = jest.spyOn(dbMock, "getOverduePosts");
      getOverduePostsSpy.mockResolvedValue(currentlyPinnedPosts);

      when(
        clientMock.featurePost(anything(), anything(), anything())
      ).thenResolve();

      const postsToUnpin = await dbMock.getOverduePosts("Daily Chat Thread");

      expect(postsToUnpin).toBe(currentlyPinnedPosts);
    } catch (err) {
      console.log(err);
    }
  });
  it("Unpins overdue posts, creates new posts and pins them", async () => {
    const clientMock = mock(LemmyApi);
    const dbMock = mock(PostgresService);
    const createsPostServiceMock = mock(CreatesPost);

    const currentlyPinnedPosts: OverduePostPin[] = [
      { postId: 0, isLocallyPinned: true },
    ];

    const getOverduePostsSpy = jest.spyOn(dbMock, "getOverduePosts");
    getOverduePostsSpy.mockResolvedValue(currentlyPinnedPosts);

    const setPostAutoRemovalSpy = jest.spyOn(dbMock, "setPostAutoRemoval");
    setPostAutoRemovalSpy.mockResolvedValue();

    const renewPostService = new RenewsPosts(
      clientMock,
      dbMock,
      createsPostServiceMock
    );

    renewPostService.renewPosts("Daily Chat Thread");

    expect(dbMock.getOverduePosts).toHaveBeenCalledTimes(1);
  });
});

describe(SchedulesPosts, () => {
  it("Handle Post Schedule", async () => {
    const clientMock = mock(LemmyApi);
    const dbMock = mock(PostgresService);
    const renewPostMock = mock(RenewsPosts);

    const postSchedulerService = new SchedulesPosts(
      clientMock,
      dbMock,
      renewPostMock
    );
  });
  it("Creates Bot Tasks", async () => {
    const clientMock = mock(LemmyApi);
    const dbMock = mock(PostgresService);
    const renewPostMock = mock(RenewsPosts);

    const postSchedulerService = new SchedulesPosts(
      clientMock,
      dbMock,
      renewPostMock
    );

    const botTasks = postSchedulerService.createBotTasks();

    expect(Array.isArray(botTasks)).toBe(true);
    expect(botTasks.length).toBe(1);
  });
});
