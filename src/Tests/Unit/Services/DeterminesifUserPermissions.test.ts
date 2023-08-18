import "reflect-metadata";
import {
  Community,
  GetPersonDetailsResponse,
  Person,
  PersonAggregates,
  PersonView,
} from "lemmy-js-client";
import { anything, capture, instance, mock, verify, when } from "ts-mockito";
import { DeterminesIfUserModeratesCommunity } from "../../../Classes/Services/DeterminesUserPermissions/DeterminesIfUserModeratesCommunity.js";
import { DeterminesIfUserIsAdmin } from "../../../Classes/Services/DeterminesUserPermissions/DeterminesIfUserIsAdmin.js";
import { Configuration } from "../../../Classes/ValueObjects/Configuration.js";
import { LemmyApi } from "../../../Classes/ValueObjects/LemmyApi.js";

describe(DeterminesIfUserModeratesCommunity, () => {
  const moderatorUserData = (() => {
    const personMock = mock<Person>();
    const personInstance: Person = instance(personMock);
    const regularUser: Person = { ...personInstance, name: "regular user" };
    const admin: Person = { ...personInstance, name: "cafe moderator" };
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

    const adminResponse: GetPersonDetailsResponse = {
      ...regularUserResponse,
      moderates: [
        {
          community: cafeCommunity,
          moderator: admin,
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
        person: admin,
        response: adminResponse,
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

describe(DeterminesIfUserIsAdmin, () => {
  const userData = (() => {
    const personMock = mock<Person>();
    const personInstance: Person = instance(personMock);
    const regularUser: Person = { ...personInstance, name: "regular user" };
    const admin: Person = { ...personInstance, name: "admin" };

    const person = instance<Person>(mock<Person>());
    const counts = instance<PersonAggregates>(mock<PersonAggregates>());
    const getPersonInterface = (isAdmin: boolean): Person => {
      return {
        ...person,
        admin: isAdmin,
      };
    };

    const regularUserResponse: GetPersonDetailsResponse = {
      person_view: {
        person: getPersonInterface(false),
        counts: counts,
      },
      posts: [],
      comments: [],
      moderates: [],
    };

    const adminResponse: GetPersonDetailsResponse = {
      person_view: {
        person: getPersonInterface(true),
        counts: counts,
      },
      posts: [],
      comments: [],
      moderates: [],
    };

    return [
      {
        person: regularUser,
        response: regularUserResponse,
        isPermitted: false,
      },
      {
        person: admin,
        response: adminResponse,
        isPermitted: true,
      },
    ];
  })();

  describe.each(userData)(
    "Check whether user has moderator permissions for community",
    (data) => {
      it(`checks if ${data.person.name} has admin permissions}`, async () => {
        const clientMock = mock(LemmyApi);

        when(clientMock.getDetailsForPerson(anything())).thenResolve(
          data.response
        );

        const handler = new DeterminesIfUserIsAdmin(
          Configuration.createFromEnv(),
          instance(clientMock)
        );

        const isCafeModerator = await handler.handle(data.person);

        verify(clientMock.getDetailsForPerson(data.person)).once();

        const [personArgument] = capture(clientMock.getDetailsForPerson).last();
        expect(personArgument).toBe(data.person);
        expect(isCafeModerator).toBe(data.isPermitted);
      });
    }
  );
});
