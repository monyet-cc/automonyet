import { Sequelize } from "sequelize-typescript";
import { DatabaseConfiguration as configuration } from "./DatabaseConfiguration.js";
import { AutomatedPost } from "./Models/AutomatedPost.js";
import { PinnedPost } from "./Models/PinnedPost.js";
import { TaskSchedule } from "./Models/TaskSchedule.js";

export function createDatabaseConnection(): Sequelize {
  new Sequelize(
    configuration.database,
    configuration.username,
    configuration.password,
    {
      dialect: configuration.type,
      schema: configuration.schema,
      port: configuration.port,
      host: configuration.host,
    }
  );

  const sequelize = new Sequelize(
    `${configuration.type}://${configuration.username}:${configuration.password}@${configuration.host}:${configuration.port}/${configuration.database}`,
    {
      schema: configuration.schema,
      dialect: "postgres",
      models: [AutomatedPost, PinnedPost, TaskSchedule],
    }
  );
  sequelize.sync({ force: false });
  return sequelize;
}

const databaseConnection: Sequelize = createDatabaseConnection();

try {
  await databaseConnection.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

export { databaseConnection };
