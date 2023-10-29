import Fastify from "fastify";

export async function communityApi(fastify: Fastify.FastifyInstance) {
  const loginForm = {
    schema: {
      body: {
        type: "object",
        properties: {
          username: { type: "string" },
          password: { type: "string" },
        },
      },
    },
  };

  fastify.post(
    "/login",
    loginForm,
    async (request: Fastify.FastifyRequest, reply: Fastify.FastifyReply) => {
      reply.send({ hello: "world" });
    }
  );
}
