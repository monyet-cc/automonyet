import Fastify from "fastify";
import { LemmyApi } from "../ValueObjects/LemmyApi.js";
import { LoginResponse } from "lemmy-js-client";
import { generateToken } from "../Services/Authentication/PasetoAuth.js";

export async function authApi(
  fastify: Fastify.FastifyInstance,
  opts: { lemmyApi: LemmyApi }
) {
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
    { schema: loginForm.schema },
    async (request: Fastify.FastifyRequest, reply: Fastify.FastifyReply) => {
      const { username, password } = request.body as {
        username: string;
        password: string;
      };
      const client = opts.lemmyApi;

      try {
        // Call the function from lemmyApi
        const result: LoginResponse = await client.login(username, password);

        if (result.registration_created) {
          const clientToken = await generateToken(result);
          reply.code(200).send(clientToken);
        } else {
          reply.code(400).send({
            message: "Invalid login credentials. Please check your details.",
          });
        }
      } catch (error) {
        reply.code(500).send({ message: "An error occurred during login." });
      }
    }
  );
}
