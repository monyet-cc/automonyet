import { CreationAttributes } from "sequelize";
import "reflect-metadata";
import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import { LemmyApi } from "../../../Classes/ValueObjects/LemmyApi.js";
import moment from "moment";
import { RenewsPosts } from "../../../Classes/Services/PostServices/RenewsPosts.js";
import { CreatesPost } from "../../../Classes/Services/PostServices/CreatesPost.js";
import { UnpinsPosts } from "../../../Classes/Services/PostServices/UnpinsPosts.js";
import { SchedulesPosts } from "./../../../Classes/Services/PostServices/SchedulesPosts.js";
import * as PostsToAutomateModule from "./../../../Classes/ValueObjects/PostsToAutomate.js";
import pkg from "cron-parser";
import { PostToCreate } from "./../../../Classes/ValueObjects/PostsToAutomate.js";
import { TaskSchedules } from "../../../Classes/Database/Repositories/TaskSchedules.js";
import { PinnedPosts } from "../../../Classes/Database/Repositories/PinnedPosts.js";
import { PinnedPost } from "../../../Classes/Database/Models/PinnedPost.js";
import { TaskSchedule } from "../../../Classes/Database/Models/TaskSchedule.js";
const parseExpression = pkg.parseExpression;

// Mocked data
const mockPostsToAutomate: PostToCreate[] = [
  {
    category: "Daily Chat Thread",
    communityName: "cafe",
    body: undefined,
    pinLocally: true,
    cronExpression: "0 0 4 * * *",
    timezone: "Asia/Kuala_Lumpur",
    title: `/c/café daily chat thread for $date`,
    dateFormat: "D MMMM YYYY",
  },
  {
    category: "Daily Food Thread",
    communityName: "food",
    body: "Use this thread to share with us what you're having, from breakfast to second breakfast, brunch, lunch, tea time, dinner, supper! Don't be shy, all food are welcome! Image are encouraged!",
    pinLocally: false,
    cronExpression: "0 0 4 * * *",
    timezone: "Asia/Kuala_Lumpur",
    title: `Daily c/food Thread - Whatcha Having Today? $date`,
    dateFormat: "Do MMMM, YYYY",
  },
  {
    category: "Weekly Care Thread",
    communityName: "mental_health",
    body: undefined,
    pinLocally: false,
    cronExpression: "0 0 4 * * 1",
    timezone: "Asia/Kuala_Lumpur",
    title: `Mental Wellness Weekly Check-in Thread $date`,
    dateFormat: "D MMMM YYYY",
  },
  {
    category: "Weekly Movies Thread",
    communityName: "movies",
    body: "Tell us what you watched this week, whether movie, series, cdrama or Kdrama!",
    pinLocally: false,
    cronExpression: "0 0 4 * * 2",
    timezone: "Asia/Kuala_Lumpur",
    title: `What did you watch this week? ($date edition)`,
    dateFormat: "Do MMM YYYY",
  },
  {
    category: "Weekly Reading Thread",
    communityName: "cafe",
    body: "Tell us what you are currently reading, or what's on your reading list!",
    pinLocally: false,
    cronExpression: "0 0 4 * * 4",
    timezone: "Asia/Kuala_Lumpur",
    title: `What is your current read? $date`,
    dateFormat: "D MMMM YYYY",
  },
];

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
      title: `/c/café daily chat thread for $date`,
      dateFormat: "D MMMM YYYY",
    };

    const clientMock = mock(LemmyApi);
    const pinnedPostRepositoryMock = mock(PinnedPosts);

    when(clientMock.getCommunityIdentifier("cafe")).thenResolve(
      expectedCommunityId
    );

    when(clientMock.createFeaturedPost(anything(), "Community")).thenResolve(
      expectedPostId
    );

    when(clientMock.featurePost(anything(), anything(), true)).thenResolve(
      expectedPostId
    );

    when(pinnedPostRepositoryMock.create(anything())).thenResolve();

    const service = new CreatesPost(
      instance(clientMock),
      instance(pinnedPostRepositoryMock)
    );

    await service.handlePostCreation(post);

    verify(clientMock.getCommunityIdentifier(expectedCommunityName)).once();
    verify(clientMock.createFeaturedPost(anything(), "Community")).once();
    verify(clientMock.featurePost(anything(), "Local", true)).once();
    verify(pinnedPostRepositoryMock.create(anything())).once();

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
    const currentlyPinnedPosts: CreationAttributes<PinnedPost>[] = [
      { id: 0, category: "", isLocallyPinned: true },
      { id: 1, category: "", isLocallyPinned: false },
      { id: 2, category: "", isLocallyPinned: true },
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
      const pinnedPostRepositoryMock = mock(PinnedPosts);

      const currentlyPinnedPosts: CreationAttributes<PinnedPost>[] = [
        { id: 0, category: "Daily Chat Thread", isLocallyPinned: true },
        { id: 1, category: "Daily Chat Thread", isLocallyPinned: false },
        { id: 2, category: "Daily Chat Thread", isLocallyPinned: true },
      ];

      const getCurrentlyPinnedPostsSpy = jest.spyOn(
        pinnedPostRepositoryMock,
        "getByCategory"
      );
      getCurrentlyPinnedPostsSpy.mockResolvedValue(currentlyPinnedPosts);

      when(
        clientMock.featurePost(anything(), anything(), anything())
      ).thenResolve();

      const postsToUnpin = await pinnedPostRepositoryMock.getByCategory(
        "Daily Chat Thread"
      );

      expect(postsToUnpin).toBe(currentlyPinnedPosts);
    } catch (err) {
      console.log(err);
    }
  });
  it("Renews Daily/Weekly Posts", async () => {
    const pinnedPostRepositoryMock = mock(PinnedPosts);
    const createsPostServiceMock = mock(CreatesPost);
    const unpinsPostServiceMock = mock(UnpinsPosts);

    const currentlyPinnedPosts: CreationAttributes<PinnedPost>[] = [
      { id: 0, category: "Daily Chat Thread", isLocallyPinned: true },
      { id: 1, category: "Daily Chat Thread", isLocallyPinned: false },
      { id: 2, category: "Daily Chat Thread", isLocallyPinned: true },
    ];

    const getCurrentlyPinnedPostsSpy = jest.spyOn(
      pinnedPostRepositoryMock,
      "getByCategory"
    );
    getCurrentlyPinnedPostsSpy.mockResolvedValue(currentlyPinnedPosts);

    const unpinPostsSpy = jest.spyOn(unpinsPostServiceMock, "unpinPosts");
    unpinPostsSpy.mockResolvedValue([0, 1, 2]);

    const clearUnpinnedPostsSpy = jest.spyOn(
      pinnedPostRepositoryMock,
      "removeByCategory"
    );
    clearUnpinnedPostsSpy.mockResolvedValue();

    const renewPostService = new RenewsPosts(
      pinnedPostRepositoryMock,
      createsPostServiceMock,
      unpinsPostServiceMock
    );

    await renewPostService.renewPosts("Daily Chat Thread");

    expect(pinnedPostRepositoryMock.getByCategory).toHaveBeenCalledTimes(1);
    expect(unpinsPostServiceMock.unpinPosts).toHaveBeenCalledTimes(1);
    expect(pinnedPostRepositoryMock.removeByCategory).toHaveBeenCalledTimes(1);
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
    const taskScheduleRepositoryMock = mock(TaskSchedules);
    const renewPostMock = mock(RenewsPosts);

    const postSchedulerService = new SchedulesPosts(
      taskScheduleRepositoryMock,
      renewPostMock
    );

    const taskSchedules = [
      {
        id: 0,
        category: "Daily Chat Thread",
        date: new Date(),
        taskType: "postsToAutomate",
      },
    ];

    const getScheduledTasksSpy = jest.spyOn(
      taskScheduleRepositoryMock,
      "getScheduledTasksByTaskType"
    );
    getScheduledTasksSpy.mockResolvedValue(taskSchedules);

    const renewPostsSpy = jest.spyOn(renewPostMock, "renewPosts");
    renewPostsSpy.mockResolvedValue();

    const updateTaskScheduleSpy = jest.spyOn(
      taskScheduleRepositoryMock,
      "setNextScheduledTimeByCategory"
    );
    updateTaskScheduleSpy.mockResolvedValue();

    const loadPostsDataSpy = jest.spyOn(PostsToAutomateModule, "loadPostsData");
    loadPostsDataSpy.mockResolvedValue(mockPostsToAutomate);

    const getNextScheduleTimeSpy = jest.spyOn(
      PostsToAutomateModule,
      "getNextScheduledTime"
    );
    getNextScheduleTimeSpy.mockReturnValueOnce(
      new Date("2023-08-25T04:00:00Z")
    );

    await postSchedulerService.handlePostSchedule();

    expect(
      taskScheduleRepositoryMock.getScheduledTasksByTaskType
    ).toHaveBeenCalledTimes(1);
    expect(renewPostMock.renewPosts).toHaveBeenCalledTimes(1);
    expect(
      taskScheduleRepositoryMock.setNextScheduledTimeByCategory
    ).toHaveBeenCalledTimes(1);
  });
  it("Creates Bot Tasks", async () => {
    const taskScheduleRepositoryMock = mock(TaskSchedules);

    const getCategoriesByTaskTypeSpy = jest.spyOn(
      taskScheduleRepositoryMock,
      "getCategoriesByTaskType"
    );
    getCategoriesByTaskTypeSpy.mockResolvedValue(["Daily Chat Thread"]);

    const taskScheduleRes = {
      id: 0,
      category: "Daily Chat Thread",
      date: new Date(),
      taskType: "postsToAutomate",
    };

    const createTaskScheduleSpy = jest.spyOn(
      taskScheduleRepositoryMock,
      "create"
    );
    createTaskScheduleSpy.mockResolvedValue(taskScheduleRes);

    const postCategories =
      await taskScheduleRepositoryMock.getCategoriesByTaskType(
        "postsToAutomate"
      );
    const postsToSchedule = [
      {
        category: "Daily Chat Thread",
        communityName: "cafe",
        body: undefined,
        pinLocally: true,
        cronExpression: "0 0 4 * * *",
        timezone: "Asia/Kuala_Lumpur",
        title: `/c/café daily chat thread for $date`,
        dateFormat: "D MMMM YYYY",
      },
    ];

    if (postsToSchedule !== undefined) {
      for (const post of postsToSchedule) {
        const params: CreationAttributes<TaskSchedule> = {
          category: post.category,
          nextScheduledTime: new Date(),
          taskType: "postsToAutomate",
        };
        await taskScheduleRepositoryMock.create(params);
      }
    }
    expect(
      taskScheduleRepositoryMock.getCategoriesByTaskType
    ).toHaveBeenCalledTimes(1);
    expect(taskScheduleRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(postCategories.length).toBe(1);
  });
});
