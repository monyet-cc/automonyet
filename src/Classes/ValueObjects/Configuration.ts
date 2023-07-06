export type BotConfiguration = {
  username: string;
  password: string;
  instance: string;
  isLocal: boolean;
};

export type InstanceConfiguration = {
  id: number;
  url: string;
};

export class Configuration {
  constructor(
    public readonly instance: InstanceConfiguration,
    public readonly bot: BotConfiguration
  ) {}

  static createFromEnv(): Configuration {
    const instanceUrl = process.env.INSTANCE_URL || "https://my.lemmy.local";

    return new Configuration(
      { id: 1, url: instanceUrl },
      {
        instance: new URL(instanceUrl).hostname,
        username: process.env.BOT_USERNAME || "username",
        password: process.env.BOT_PASSWORD || "password",
        isLocal: true,
      }
    );
  }
}
