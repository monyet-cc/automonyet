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
      port: configuration.port,
      host: configuration.host,
    }
  );

  return new Sequelize(
    `${configuration.type}://${configuration.username}:${configuration.password}@${configuration.host}:${configuration.port}/${configuration.database}`,
    {
      dialect: "postgres",
      models: [AutomatedPost, PinnedPost, TaskSchedule],
    }
  );
}

const databaseConnection: Sequelize = createDatabaseConnection();

try {
  await databaseConnection.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

export { databaseConnection };
