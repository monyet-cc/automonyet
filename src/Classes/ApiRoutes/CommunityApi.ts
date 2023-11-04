import Fastify from "fastify";
import { LemmyApi } from "../ValueObjects/LemmyApi.js";

export async function communityApi(
  fastify: Fastify.FastifyInstance,
  opts: { lemmyApi: LemmyApi }
) {
  fastify.get(
    "/community",
    async (request: Fastify.FastifyRequest, reply: Fastify.FastifyReply) => {
      const client = opts.lemmyApi;
      const headers = request.headers;
    }
  );
}
