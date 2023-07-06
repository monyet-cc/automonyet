import { LemmyHttp } from "lemmy-js-client";
import { Configuration } from "../ValueObjects/Configuration";
import { LemmyApi } from "../ValueObjects/LemmyApi";

export class LemmyApiFactory {
  public static async create(configuration: Configuration): Promise<LemmyApi> {
    const client: LemmyHttp = new LemmyHttp(configuration.url);
    const token = (
      await client.login({
        username_or_email: configuration.bot.username,
        password: configuration.bot.password,
      })
    ).jwt;

    if (token === undefined) {
      throw new Error(
        `Unable to authenticate with instance API ${configuration.url}`
      );
    }

    return new LemmyApi(client, token);
  }
}
