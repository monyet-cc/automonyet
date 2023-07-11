import { stripIndents } from "common-tags";
import { provide } from "inversify-binding-decorators";
import { Person } from "lemmy-js-client";
import moment from "moment";
import { DeterminesIfUserModeratesCommunity } from "../../Services/DeterminesIfUserModeratesCommunity.js";
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
    return /^automod daily joke:(.*)$/;
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
    const joke: string | null = match !== null ? match[1].trim() : null;

    if (joke !== null) {
      const communityIdentifier = await this.client.getCommunityIdentifier(
        this.communityName
      );

      await this.client.createFeaturedPost(
        {
          name: `/c/café daily chat thread for ${moment().format(
            "D MMMM YYYY"
          )}`,
          body: stripIndents(`Joke of the day:

          ${joke}
          `),
          community_id: communityIdentifier,
        },
        "Local"
      );
    }
  }
}
