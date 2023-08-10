import "reflect-metadata";
import {
  anyNumber,
  anything,
  capture,
  instance,
  mock,
  verify,
  when,
} from "ts-mockito";
import { LemmyApi } from "../../../Classes/ValueObjects/LemmyApi.js";
import moment from "moment";
import {
  PostgresService,
  TaskSchedule,
} from "../../../Classes/Services/PostgresService.js";
import { SchedulesPosts } from "./../../../Classes/Services/PostSchedulingServices/SchedulesPosts.js";
import { OverduePostPin } from "../../../Classes/Services/PostgresService.js";
import { postsToAutomate } from "../../../Classes/ValueObjects/PostsToAutomate.js";
import { RenewsPosts } from "../../../Classes/Services/PostSchedulingServices/RenewsPosts.js";

describe(RenewsPosts, () => {
  it("Get Currently Pinned Posts", async () => {
    try {
      const clientMock = mock(LemmyApi);
      const dbMock = mock(PostgresService);

      const currentlyPinnedPosts: OverduePostPin[] = [
        { postId: 0, isLocallyPinned: true },
      ];

      const getOverduePostsSpy = jest.spyOn(dbMock, "getOverduePosts");
      getOverduePostsSpy.mockResolvedValue(currentlyPinnedPosts);

      when(
        clientMock.featurePost(anything(), anything(), anything())
      ).thenResolve();

      const postsToUnpin = await dbMock.getOverduePosts("Daily Chat Thread");
      console.log(postsToUnpin);

      expect(postsToUnpin).toBe(currentlyPinnedPosts);
    } catch (err) {
      console.log(err);
    }
  });
  it("Unpins overdue posts, creates new posts and pins them", async () => {
    const clientMock = mock(LemmyApi);
    const dbMock = mock(PostgresService);

    const currentlyPinnedPosts: OverduePostPin[] = [
      { postId: 0, isLocallyPinned: true },
    ];

    when(dbMock.getOverduePosts("Daily Chat Thread")).thenResolve(
      currentlyPinnedPosts
    );

    when(clientMock.getCommunityIdentifier("cafe")).thenResolve(101);

    when(clientMock.createFeaturedPost(anything(), "Community")).thenResolve(1);

    when(
      clientMock.featurePost(anything(), anything(), anything())
    ).thenResolve();

    when(dbMock.setPostAutoRemoval(0, "Daily Chat Thread", true)).thenResolve();

    const renewPostService = new RenewsPosts(clientMock, dbMock);

    renewPostService.renewPosts("Daily Chat Thread");
  });
});
