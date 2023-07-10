import "reflect-metadata";
import { instance, mock, when, capture, verify } from "ts-mockito";
import { DeterminesIfUserModeratesCommunity } from "../../../Classes/Services/DeterminesIfUserModeratesCommunity.js";
import { LemmyApi } from "../../../Classes/ValueObjects/LemmyApi.js";
import {
  Community,
  CommunityModeratorView,
  GetPersonDetailsResponse,
  Person,
} from "lemmy-js-client";
import { Configuration } from "../../../Classes/ValueObjects/Configuration.js";

describe("Check whether user has moderator permissions for community", () => {
  it("permits only community moderators to post", async () => {
    //test data
    const expectedCommunityName = "cafe";
    const expectedInstanceId = 1;

    const communityMock = mock<Community>();
    const cafeCommunity: Community = instance(communityMock);
    cafeCommunity.id = 100;
    cafeCommunity.name = "cafe";
    cafeCommunity.instance_id = 1;

    const otherCommunity: Community = instance(communityMock);
    otherCommunity.id = 101;
    otherCommunity.name = "other";
    otherCommunity.instance_id = 2;

    const personMock = mock<Person>();
    const regularUser: Person = instance(personMock);
    regularUser.name = "regular user";
    const cafeModerator: Person = instance(personMock);
    cafeModerator.name = "cafe moderator";
    const otherCommunityModerator: Person = instance(personMock);
    otherCommunityModerator.name = "other community mod";

    const personDetailsReponseMock = mock<GetPersonDetailsResponse>();
    const regularUserDetails: GetPersonDetailsResponse = instance(
      personDetailsReponseMock
    );
    regularUserDetails.moderates = [];

    const cafeModeratorUserDetails: GetPersonDetailsResponse = instance(
      personDetailsReponseMock
    );
    cafeModeratorUserDetails.moderates = [
      {
        community: cafeCommunity,
        moderator: cafeModerator,
      },
    ];

    const otherCommunityModeratorUserDetails: GetPersonDetailsResponse =
      instance(personDetailsReponseMock);
    otherCommunityModeratorUserDetails.moderates = [
      {
        community: otherCommunity,
        moderator: otherCommunityModerator,
      },
    ];

    const configMock = mock(Configuration);
    const clientMock = mock(LemmyApi);

    when(clientMock.getDetailsForPerson(regularUser)).thenResolve(
      regularUserDetails
    );

    when(clientMock.getDetailsForPerson(cafeModerator)).thenResolve(
      cafeModeratorUserDetails
    );

    when(clientMock.getDetailsForPerson(otherCommunityModerator)).thenResolve(
      otherCommunityModeratorUserDetails
    );

    const handler = new DeterminesIfUserModeratesCommunity(
      instance(configMock),
      instance(clientMock)
    );

    const isCafeModerator = await handler.handle(
      cafeModerator,
      expectedCommunityName
    );

    verify(clientMock.getDetailsForPerson(cafeModerator)).once();

    const [user] = capture(clientMock.getDetailsForPerson).last();

    expect(user).toBe(cafeModerator);
    expect(isCafeModerator).toBe(true);
  }, 20000);
});
