import { Person } from "lemmy-js-client";
import { LemmyApiFactory } from "../Factories/LemmyApiFactory";
import { Configuration } from "../ValueObjects/Configuration";

export class DeterminesIfUserModeratesCommunity {
  public static async handle(
    person: Person,
    community: string
  ): Promise<boolean> {
    const configuration = Configuration.createFromEnv();
    const client = await LemmyApiFactory.create(configuration);
    const details = await client.getDetailsForPerson(person);

    return (
      details.moderates.find(
        (communityModerator) =>
          communityModerator.community.instance_id ===
            configuration.instance.id &&
          communityModerator.community.name === community
      ) !== undefined
    );
  }
}
