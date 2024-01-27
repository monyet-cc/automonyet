import { provide } from "inversify-binding-decorators";
import { Person } from "lemmy-js-client";
import { Configuration } from "../../ValueObjects/Configuration.js";
import { LemmyApi } from "../../ValueObjects/LemmyApi.js";

@provide(DeterminesIfUserIsAdmin)
export class DeterminesIfUserIsAdmin {
  constructor(private configuration: Configuration, private client: LemmyApi) {}

  public async handle(person: Person): Promise<boolean> {
    const details = await this.client.getDetailsForPerson(person);

    return details.person_view.is_admin;
  }
}
