import { Sequelize } from "sequelize-typescript";
import { DatabaseConfiguration as configuration } from "./DatabaseConfiguration.js";

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

  return new Sequelize(
    `${configuration.type}://${configuration.username}:${configuration.password}@${configuration.host}:${configuration.port}/${configuration.database}`,
    { schema: configuration.schema, dialect: "postgres" }
  );
}

const databaseConnection: Sequelize = createDatabaseConnection();

try {
  await databaseConnection.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

databaseConnection.addModels(["./Database/Models"]);

export { databaseConnection };
