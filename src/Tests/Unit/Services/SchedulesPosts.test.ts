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
import {
  PostgresService,
  TaskSchedule,
} from "../../../Classes/Services/PostgresService.js";
import { SchedulesPosts } from "./../../../Classes/Services/SchedulesPosts.js";
import { OverduePostPin } from "../../../Classes/Services/PostgresService.js";
import { postsToAutomate } from "../../../Classes/ValueObjects/PostsToAutomate.js";

describe(SchedulesPosts, () => {
  it("Handle Post Schedule", async () => {
    const clientMock = mock(LemmyApi);
    const dbMock = mock(PostgresService);

    const postSchedulerService = new SchedulesPosts(clientMock, dbMock);

    const postsToSchedule: TaskSchedule[] = [
      { category: "Daily Chat Thread", nextScheduledTime: new Date() },
    ];

    when(dbMock.getScheduledTasks("postsToAutomate")).thenResolve(
      postsToSchedule
    );

    const currentlyPinnedPosts: OverduePostPin[] = [
      { postId: 0, isLocallyPinned: true },
    ];

    when(dbMock.getOverduePosts("Daily Chat Thread")).thenResolve(
      currentlyPinnedPosts
    );

    when(
      dbMock.updateTaskSchedule(anything(), "Daily Chat Thread")
    ).thenResolve();

    when(clientMock.getCommunityIdentifier("cafe")).thenResolve(0);
    when(clientMock.createFeaturedPost(anything(), "Community")).thenResolve(1);
    when(clientMock.featurePost(anything(), "Local", true)).thenResolve();

    when(
      dbMock.setPostAutoRemoval(anything(), "Daily Chat Thread", anything())
    ).thenResolve();

    await postSchedulerService.handlePostSchedule();

    verify(dbMock.getScheduledTasks("postsToAutomate")).once();
    verify(dbMock.getOverduePosts("Daily Chat Thread")).once();
    verify(dbMock.updateTaskSchedule(anything(), "Daily Chat Thread")).once();
  });
  it("Creates Bot Tasks", async () => {
    const clientMock = mock(LemmyApi);
    const dbMock = mock(PostgresService);

    const postSchedulerService = new SchedulesPosts(clientMock, dbMock);

    const botTasks = postSchedulerService.createBotTasks();

    expect(Array.isArray(botTasks)).toBe(true);
    expect(botTasks.length).toBe(1);
  });
});
