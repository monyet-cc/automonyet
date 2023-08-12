import { stripIndents } from "common-tags";
import { provide } from "inversify-binding-decorators";
import { Person } from "lemmy-js-client";
import { DeterminesIfUserIsAdmin } from "../../Services/DeterminesUserPermissions.js";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { HandlesPrivateMessage } from "../HandlesPrivateMessage.js";
import { SchedulesPosts } from "../../Services/PostServices/SchedulesPosts.js";

@provide(SchedulesPostsHandling)
export class SchedulesPostsHandling implements HandlesPrivateMessage {
  constructor(
    private readonly determinesIfUserIsAdmin: DeterminesIfUserIsAdmin,
    private readonly postSchedulerService: SchedulesPosts
  ) {}

  public getMatchExpression(): RegExp {
    return /^schedule posts?$/;
  }

  public async hasPermission(person: Person): Promise<boolean> {
    return await this.determinesIfUserIsAdmin.handle(person);
  }

  public async handle(message: string): Promise<void> {
    await this.postSchedulerService.handlePostSchedule();
  }
}
