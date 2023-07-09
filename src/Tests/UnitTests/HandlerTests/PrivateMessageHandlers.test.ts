import { LemmyApiFactoryMock } from "./../../Mocks/LemmyApiFactoryMock.js";
import { LemmyHttp } from "lemmy-js-client";
import { HandlesPrivateMessage } from "../../../Classes/Handlers/HandlesPrivateMessage.js";
import { CreatesDailyThread } from "../../../Classes/Handlers/PrivateMessages/CreatesDailyThread.js";
import { Configuration } from "../../../Classes/ValueObjects/Configuration.js";
import { when, anything } from "ts-mockito";
import { createHttpMock } from "../../Mocks/LemmyHttpMock.js";
import { DeterminesIfUserModeratesCommunity } from "../../../Classes/Services/DeterminesIfUserModeratesCommunity.js";

describe("Test: Daily Thread", () => {
  it("Create Daily Thread", async () => {
    // Create a mock LemmyHttp instance using a mocking library like ts-mockito
    const httpMock: LemmyHttp = createHttpMock();

    // Mock the login method of the LemmyHttp instance
    when(httpMock.login(anything())).thenResolve({
      jwt: "mocked-jwt",
      registration_created: false,
      verify_email_sent: false,
    });

    const configuration = Configuration.createFromEnv();
    const apiFactory = new LemmyApiFactoryMock(configuration, httpMock);

    const apiMock = await apiFactory.create();

    // initialise the private message handlers
    const privateMessageHandlers: HandlesPrivateMessage[] = [
      new CreatesDailyThread(
        configuration,
        apiMock,
        new DeterminesIfUserModeratesCommunity(configuration, apiMock)
      ),
    ];

    const matchingHandler: HandlesPrivateMessage | undefined =
      privateMessageHandlers.find((value: HandlesPrivateMessage) =>
        value.getMatchExpression().exec("automod daily joke: test joke")
      );

    expect(matchingHandler).toBeDefined();
  });
});
