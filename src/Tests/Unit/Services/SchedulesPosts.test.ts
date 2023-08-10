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
import { SchedulesPosts } from "./../../../Classes/Services/PostSchedulingServices/SchedulesPosts.js";
import { OverduePostPin } from "../../../Classes/Services/PostgresService.js";
import { postsToAutomate } from "../../../Classes/ValueObjects/PostsToAutomate.js";
import { RenewsPosts } from "../../../Classes/Services/PostSchedulingServices/RenewsPosts.js";

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
