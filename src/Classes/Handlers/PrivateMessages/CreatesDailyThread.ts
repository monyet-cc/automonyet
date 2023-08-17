import { stripIndents } from "common-tags";
import { provide } from "inversify-binding-decorators";
import { Person } from "lemmy-js-client";
import moment from "moment";
import { DeterminesIfUserModeratesCommunity } from "../../Services/DeterminesUserPermissions/DeterminesIfUserModeratesCommunity.js";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";
import { HandlesPrivateMessage } from "../HandlesPrivateMessage.js";

@provide(CreatesDailyThread)
export class CreatesDailyThread implements HandlesPrivateMessage {
  private communityName = "cafe";

  constructor(
    private readonly client: LemmyApi,
    private readonly determinesIfUserModeratesCommunity: DeterminesIfUserModeratesCommunity
  ) {}

  public getMatchExpression(): RegExp {
    return /^automod daily joke:?([\s\S]*)$/;
  }

  public async hasPermission(person: Person): Promise<boolean> {
    return await this.determinesIfUserModeratesCommunity.handle(
      person,
      this.communityName
    );
  }

  public async handle(message: string): Promise<void> {
    const match: RegExpExecArray | null =
      this.getMatchExpression().exec(message);
    const joke: string | null =
      match !== null && match[1] !== undefined && match[1].trim() !== ""
        ? match[1].trim()
        : "knock knock, who's there, no one, no one? because no one put a joke here";

    const communityIdentifier = await this.client.getCommunityIdentifier(
      this.communityName
    );

    await this.client.createFeaturedPost(
      {
        name: `/c/café daily chat thread for ${moment().format("D MMMM YYYY")}`,
        body: stripIndents(`Joke of the day:

          ${joke}
          `),
        community_id: communityIdentifier,
      },
      "Local"
    );
  }
}
