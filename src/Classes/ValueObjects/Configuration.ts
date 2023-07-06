export type BotConfiguration = {
  username: string;
  password: string;
  instance: string;
  isLocal: boolean;
};

export class Configuration {
  constructor(
    public readonly url: string,
    public readonly bot: BotConfiguration
  ) {}

  static createFromEnv(): Configuration {
    const instanceUrl = process.env.INSTANCE_URL || "https://my.lemmy.local";

    return new Configuration(instanceUrl, {
      instance: new URL(instanceUrl).hostname,
      username: process.env.BOT_USERNAME || "username",
      password: process.env.BOT_PASSWORD || "password",
      isLocal: true,
    });
  }
}
