import "reflect-metadata";
import {
  Community,
  GetPersonDetailsResponse,
  Person,
  PersonView,
} from "lemmy-js-client";
import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import { DeterminesIfUserModeratesCommunity } from "../../../Classes/Services/DeterminesIfUserModeratesCommunity.js";
import { Configuration } from "../../../Classes/ValueObjects/Configuration.js";
import { LemmyApi } from "../../../Classes/ValueObjects/LemmyApi.js";

describe(DeterminesIfUserModeratesCommunity, () => {
  const moderatorUserData = (() => {
    const personMock = mock<Person>();
    const personInstance: Person = instance(personMock);
    const regularUser: Person = { ...personInstance, name: "regular user" };
    const cafeModerator: Person = { ...personInstance, name: "cafe moderator" };
    const otherCommunityModerator: Person = {
      ...personInstance,
      name: "other community mod",
    };

    const communityMock = mock<Community>();
    const communityInstance: Community = instance(communityMock);
    const cafeCommunity: Community = {
      ...communityInstance,
      id: 100,
      name: "cafe",
      instance_id: 1,
    };
    const otherCommunity: Community = {
      ...communityInstance,
      id: 101,
      name: "other",
      instance_id: 2,
    };

    const regularUserResponse: GetPersonDetailsResponse = {
      person_view: instance<PersonView>(mock<PersonView>()),
      posts: [],
      comments: [],
      moderates: [],
    };

    const cafeModeratorResponse: GetPersonDetailsResponse = {
      ...regularUserResponse,
      moderates: [
        {
          community: cafeCommunity,
          moderator: cafeModerator,
        },
      ],
    };

    const otherCommunityModeratorResponse: GetPersonDetailsResponse = {
      ...regularUserResponse,
      moderates: [
        {
          community: otherCommunity,
          moderator: otherCommunityModerator,
        },
      ],
    };

    return [
      {
        person: regularUser,
        response: regularUserResponse,
        isPermitted: false,
      },
      {
        person: cafeModerator,
        response: cafeModeratorResponse,
        isPermitted: true,
      },
      {
        person: otherCommunityModerator,
        response: otherCommunityModeratorResponse,
        isPermitted: false,
      },
    ];
  })();

  const expectedCommunityName = "cafe";

  describe.each(moderatorUserData)(
    "Check whether user has moderator permissions for community",
    (data) => {
      it(`checks if ${data.person.name} has moderator permissions for ${expectedCommunityName}`, async () => {
        const clientMock = mock(LemmyApi);

        when(clientMock.getDetailsForPerson(anything())).thenResolve(
          data.response
        );

        const handler = new DeterminesIfUserModeratesCommunity(
          Configuration.createFromEnv(),
          instance(clientMock)
        );

        const isCafeModerator = await handler.handle(
          data.person,
          expectedCommunityName
        );

        verify(clientMock.getDetailsForPerson(data.person)).once();

        const [personArgument] = capture(clientMock.getDetailsForPerson).last();
        expect(personArgument).toBe(data.person);
        expect(isCafeModerator).toBe(data.isPermitted);
      });
    }
  );
});
