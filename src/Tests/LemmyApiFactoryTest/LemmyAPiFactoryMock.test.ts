import { LemmyApiMock } from "./LemmyApiFactoryMock";
import { personMock, createDTPostMock } from "./LemmyApiFactoryMockData";

describe("LemmyApiMock", () => {
  it("create post", async () => {
    const apiMock = LemmyApiMock(createDTPostMock, "Local", personMock);

    const postId = await apiMock.createPost(createDTPostMock);
    console.log(postId);

    expect(Number.isInteger(postId)).toBe(true);
  });
});
