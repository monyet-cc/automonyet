import * as dotenv from "dotenv";
import { Container } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";
import { LemmyApiFactory } from "../Factories/LemmyApiFactory.js";
import { Configuration } from "../ValueObjects/Configuration.js";
import { LemmyApi } from "../ValueObjects/LemmyApi.js";
import { PostgresClient } from "../ValueObjects/PostgresClient.js";

dotenv.config();

const container = new Container();
const configuration = Configuration.createFromEnv();
const dbClient = PostgresClient.initPostgresClient();
container.bind<Configuration>(Configuration).toConstantValue(configuration);
container.bind<PostgresClient>(PostgresClient).toConstantValue(dbClient);
container
  .bind<LemmyApi>(LemmyApi)
  .toConstantValue(await new LemmyApiFactory(configuration).create());

container.load(buildProviderModule());

export { container };
