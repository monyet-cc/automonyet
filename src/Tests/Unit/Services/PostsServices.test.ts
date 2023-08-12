import { TaskSchedule } from "./../../../../dist/Classes/Services/PostgresService.d";
import "reflect-metadata";
import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import { LemmyApi } from "../../../Classes/ValueObjects/LemmyApi.js";
import moment from "moment";
import { PostgresService } from "../../../Classes/Services/PostgresService.js";
import { OverduePostPin } from "../../../Classes/Services/PostgresService.js";
import { RenewsPosts } from "../../../Classes/Services/PostServices/RenewsPosts.js";
import {
  CreatesPost,
  UnpinsPosts,
} from "../../../Classes/Services/PostServices/PostService.js";
import { SchedulesPosts } from "./../../../Classes/Services/PostServices/SchedulesPosts.js";
import pkg from "cron-parser";
const parseExpression = pkg.parseExpression;

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

describe(UnpinsPosts, () => {
  it("Unpins", async () => {
    const clientMock = mock(LemmyApi);
    const currentlyPinnedPosts: OverduePostPin[] = [
      { postId: 0, isLocallyPinned: true },
      { postId: 1, isLocallyPinned: false },
      { postId: 2, isLocallyPinned: true },
    ];

    when(
      clientMock.featurePost(anything(), anything(), anything())
    ).thenResolve();

    const unpinPostsService = new UnpinsPosts(clientMock);
    const postIds = await unpinPostsService.unpinPosts(currentlyPinnedPosts);

    expect(postIds).toStrictEqual([0, 1, 2]);
  });
});

describe(RenewsPosts, () => {
  it("Get Currently Pinned Posts", async () => {
    try {
      const clientMock = mock(LemmyApi);
      const dbMock = mock(PostgresService);

      const currentlyPinnedPosts: OverduePostPin[] = [
        { postId: 0, isLocallyPinned: true },
        { postId: 1, isLocallyPinned: false },
        { postId: 2, isLocallyPinned: true },
      ];

      const getCurrentlyPinnedPostsSpy = jest.spyOn(
        dbMock,
        "getCurrentlyPinnedPosts"
      );
      getCurrentlyPinnedPostsSpy.mockResolvedValue(currentlyPinnedPosts);

      when(
        clientMock.featurePost(anything(), anything(), anything())
      ).thenResolve();

      const postsToUnpin = await dbMock.getCurrentlyPinnedPosts(
        "Daily Chat Thread"
      );

      expect(postsToUnpin).toBe(currentlyPinnedPosts);
    } catch (err) {
      console.log(err);
    }
  });
  it("Renews Daily/Weekly Posts", async () => {
    const clientMock = mock(LemmyApi);
    const dbMock = mock(PostgresService);
    const createsPostServiceMock = mock(CreatesPost);
    const unpinsPostServiceMock = mock(UnpinsPosts);

    const currentlyPinnedPosts: OverduePostPin[] = [
      { postId: 0, isLocallyPinned: true },
      { postId: 1, isLocallyPinned: false },
      { postId: 2, isLocallyPinned: true },
    ];

    const getCurrentlyPinnedPostsSpy = jest.spyOn(
      dbMock,
      "getCurrentlyPinnedPosts"
    );
    getCurrentlyPinnedPostsSpy.mockResolvedValue(currentlyPinnedPosts);

    const unpinPostsSpy = jest.spyOn(unpinsPostServiceMock, "unpinPosts");
    unpinPostsSpy.mockResolvedValue([0, 1, 2]);

    const clearUnpinnedPostsSpy = jest.spyOn(dbMock, "clearUnpinnedPosts");
    clearUnpinnedPostsSpy.mockResolvedValue();

    const renewPostService = new RenewsPosts(
      clientMock,
      dbMock,
      createsPostServiceMock,
      unpinsPostServiceMock
    );

    await renewPostService.renewPosts("Daily Chat Thread");

    expect(dbMock.getCurrentlyPinnedPosts).toHaveBeenCalledTimes(1);
    expect(unpinsPostServiceMock.unpinPosts).toHaveBeenCalledTimes(1);
    expect(dbMock.clearUnpinnedPosts).toHaveBeenCalledTimes(1);
  });
});

describe(SchedulesPosts, () => {
  it("Get next scheduled time", async () => {
    const currentTime = moment();
    const scheduledTimeToday = currentTime
      .clone()
      .startOf("day")
      .add(4, "hours");
    const expectedNextScheduledTime = scheduledTimeToday.isAfter(currentTime)
      ? scheduledTimeToday
      : scheduledTimeToday.add(1, "day");
    const cronExpression = "0 0 4 * * *";

    const interval = parseExpression(cronExpression);
    const nextScheduledTime = new Date(interval.next().toString());
    expect(moment(nextScheduledTime).isSame(expectedNextScheduledTime)).toBe(
      true
    );
  });
  it("Handle Post Schedule", async () => {
    const clientMock = mock(LemmyApi);
    const dbMock = mock(PostgresService);
    const renewPostMock = mock(RenewsPosts);

    const postSchedulerService = new SchedulesPosts(
      clientMock,
      dbMock,
      renewPostMock
    );

    const taskSchedules: TaskSchedule[] = [
      {
        category: "Daily Chat Thread",
        nextScheduledTime: new Date(),
      },
    ];

    const getScheduledTasksSpy = jest.spyOn(dbMock, "getScheduledTasks");
    getScheduledTasksSpy.mockResolvedValue(taskSchedules);

    const renewPostsSpy = jest.spyOn(renewPostMock, "renewPosts");
    renewPostsSpy.mockResolvedValue();

    const updateTaskScheduleSpy = jest.spyOn(dbMock, "updateTaskSchedule");
    updateTaskScheduleSpy.mockResolvedValue();

    await postSchedulerService.handlePostSchedule();

    expect(dbMock.getScheduledTasks).toHaveBeenCalledTimes(1);
    expect(renewPostMock.renewPosts).toHaveBeenCalledTimes(1);
    expect(dbMock.updateTaskSchedule).toHaveBeenCalledTimes(1);
  });
  it("Creates Bot Tasks", async () => {
    const clientMock = mock(LemmyApi);
    const dbMock = mock(PostgresService);
    const renewPostMock = mock(RenewsPosts);

    const initPostScheduleTasksSpy = jest.spyOn(
      dbMock,
      "initPostScheduleTasks"
    );
    initPostScheduleTasksSpy.mockResolvedValue();

    const postSchedulerService = new SchedulesPosts(
      clientMock,
      dbMock,
      renewPostMock
    );

    const botTasks = await postSchedulerService.createBotTasks();

    expect(Array.isArray(botTasks)).toBe(true);
    expect(botTasks.length).toBe(1);
    expect(dbMock.initPostScheduleTasks).toHaveBeenCalledTimes(1);
  });
});
