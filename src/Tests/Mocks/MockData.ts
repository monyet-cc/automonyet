import { stripIndents } from "common-tags";
import {
  PersonAggregates,
  Person,
  Community,
  CommunityModeratorView,
} from "lemmy-js-client";
import moment from "moment";

export const personAggMock: PersonAggregates = {
  id: 0,
  person_id: 0,
  post_count: 0,
  post_score: 0,
  comment_count: 0,
  comment_score: 0,
};

export const personMock: Person = {
  id: 0,
  name: "Admin",
  display_name: "Admin",
  avatar: undefined,
  banned: false,
  published: "",
  updated: "",
  actor_id: "",
  bio: "Admin user",
  local: true,
  banner: undefined,
  deleted: false,
  inbox_url: "",
  matrix_user_id: undefined,
  admin: true,
  bot_account: false,
  ban_expires: "",
  instance_id: 0,
};

export const communityMock: Community = {
  id: 0,
  name: "cafe",
  title: "Café",
  description: "cafe",
  removed: false,
  published: "",
  updated: "",
  deleted: false,
  nsfw: false,
  actor_id: "",
  local: true,
  icon: "",
  banner: "",
  followers_url: "",
  inbox_url: "",
  hidden: false,
  posting_restricted_to_mods: false,
  instance_id: 0,
};

export const communityModViewMock = (
  person: Person
): CommunityModeratorView => {
  return {
    community: communityMock,
    moderator: person,
  };
};

export const createDTPostMock = {
  name: `/c/café daily chat thread for ${moment().format("D MMMM YYYY")}`,
  community_id: 0,
  url: undefined,
  body: stripIndents(`Joke of the day: Common Dad Joke`),
  honeypot: undefined,
  nsfw: false,
  language_id: undefined,
};
