import { Configuration } from "../../Classes/ValueObjects/Configuration.js";
import { LemmyApiMock } from "./LemmyApiMock.js";
import { LemmyHttp } from "lemmy-js-client";

export class LemmyApiFactoryMock {
  constructor(private configuration: Configuration, private http: LemmyHttp) {}

  public async create(): Promise<LemmyApiMock> {
    const token = (
      await this.http.login({
        username_or_email: this.configuration.bot.username,
        password: this.configuration.bot.password,
      })
    ).jwt;

    if (token === undefined) {
      throw new Error(
        `Unable to authenticate with instance API ${this.configuration.instance.url}`
      );
    }

    return new LemmyApiMock(this.http, token);
  }
}
