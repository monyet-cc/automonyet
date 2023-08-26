import * as dotenv from "dotenv";
import { Container, ContainerModule } from "inversify";
import { buildProviderModule } from "inversify-binding-decorators";
import { LemmyApiFactory } from "../Factories/LemmyApiFactory.js";
import { Configuration } from "../ValueObjects/Configuration.js";
import { LemmyApi } from "../ValueObjects/LemmyApi.js";
import { Sequelize } from "sequelize";
import { InversifyTypes } from "../ValueObjects/InversifyTypes.js";
import { databaseConnection } from "../Database/ConfiguresDatabaseConnection.js";

dotenv.config();

const container = new Container();
const configuration = Configuration.createFromEnv();

const dependencies = new ContainerModule((bind) => {
  bind<Sequelize>(InversifyTypes.DatabaseConnection).toConstantValue(
    databaseConnection
  );
});

container.bind<Configuration>(Configuration).toConstantValue(configuration);
container
  .bind<LemmyApi>(LemmyApi)
  .toConstantValue(await new LemmyApiFactory(configuration).create());

container.load(buildProviderModule(), dependencies);

export { container };
