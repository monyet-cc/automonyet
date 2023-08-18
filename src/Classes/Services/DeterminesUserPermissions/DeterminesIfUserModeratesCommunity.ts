import { provide } from "inversify-binding-decorators";
import { CommunityModeratorView, Person } from "lemmy-js-client";
import { Configuration } from "../../ValueObjects/Configuration.js";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";

@provide(DeterminesIfUserModeratesCommunity)
export class DeterminesIfUserModeratesCommunity {
  constructor(private configuration: Configuration, private client: LemmyApi) {}

  public async handle(person: Person, community: string): Promise<boolean> {
    const details = await this.client.getDetailsForPerson(person);

    return (
      details.moderates.find(
        (communityModerator: CommunityModeratorView) =>
          communityModerator.community.instance_id ===
            this.configuration.instance.id &&
          communityModerator.community.name === community
      ) !== undefined
    );
  }
}
