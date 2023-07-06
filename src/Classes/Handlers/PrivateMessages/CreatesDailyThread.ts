import { stripIndents } from "common-tags";
import { BotActions } from "lemmy-bot";
import { Person } from "lemmy-js-client";
import moment from "moment";
import { LemmyApiFactory } from "../../Factories/LemmyApiFactory";
import { DeterminesIfUserModeratesCommunity } from "../../Services/DeterminesIfUserModeratesCommunity";
import { Configuration } from "../../ValueObjects/Configuration";
import { LemmyApi } from "../../ValueObjects/LemmyApi";
import { HandlesPrivateMessage } from "../HandlesPrivateMessage";

export class CreatesDailyThread implements HandlesPrivateMessage {
  private communityName = "cafe";

  constructor(public readonly configuration: Configuration) {}

  public getMatchExpression(): RegExp {
    return /^automod daily joke:(.*)$/;
  }

  public async hasPermission(person: Person): Promise<boolean> {
    return await DeterminesIfUserModeratesCommunity.handle(
      person,
      this.communityName
    );
  }

  public async handle(message: string, bot: BotActions): Promise<void> {
    const api: LemmyApi = await LemmyApiFactory.create(this.configuration);
    const match: RegExpExecArray | null =
      this.getMatchExpression().exec(message);
    const joke: string | null = match !== null ? match[1].trim() : null;

    if (joke !== null) {
      const communityIdentifier = await bot.getCommunityId({
        instance: this.configuration.bot.instance,
        name: this.communityName,
      });

      if (communityIdentifier === undefined) {
        throw new Error(
          `Unable to find community id for name: ${this.communityName}`
        );
      }

      await api.createFeaturedPost(
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
