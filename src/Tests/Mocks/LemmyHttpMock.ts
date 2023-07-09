import { mock, when, anything, instance } from "ts-mockito";
import { LemmyHttp } from "lemmy-js-client";

function createHttpMock(): LemmyHttp {
  // Create a mock LemmyHttp instance using a mocking library like ts-mockito
  const httpMock: LemmyHttp = mock(LemmyHttp);

  // Mock the login method of the LemmyHttp instance
  when(httpMock.login(anything())).thenResolve({
    jwt: "mocked-jwt",
    registration_created: false,
    verify_email_sent: false,
  });

  return instance(httpMock);
}

// Export the function for creating the mock instance
export { createHttpMock };
