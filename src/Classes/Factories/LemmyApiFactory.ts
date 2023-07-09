import { injectable } from "inversify";
import { LemmyHttp } from "lemmy-js-client";
import { Configuration } from "../ValueObjects/Configuration.js";
import { LemmyApi } from "../ValueObjects/LemmyApi.js";

@injectable()
export class LemmyApiFactory {
  constructor(private configuration: Configuration) {}

  public async create(): Promise<LemmyApi> {
    const client: LemmyHttp = new LemmyHttp(this.configuration.instance.url);
    const token = (
      await client.login({
        username_or_email: this.configuration.bot.username,
        password: this.configuration.bot.password,
      })
    ).jwt;

    if (token === undefined) {
      throw new Error(
        `Unable to authenticate with instance API ${this.configuration.instance.url}`
      );
    }

    return new LemmyApi(client, token);
  }
}
