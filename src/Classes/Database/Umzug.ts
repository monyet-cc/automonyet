import { SequelizeStorage, Umzug } from "umzug";
import { DataType, Sequelize } from "sequelize-typescript";
import { DataTypes } from "sequelize";
import { createDatabaseConnection } from "./ConfiguresDatabaseConnection.js";

const databaseConnection: Sequelize = createDatabaseConnection();

// This is a standalone file intended to be used as the migrator tool
// see `npm run migrate-up` and `npm run migrate-down`
new Umzug({
  migrations: [
    {
      name: "20230825092240-init",
      async up({ context }) {
        await context.createTable("pinned_post", {
          postId: {
            type: DataTypes.INTEGER,
          },
          category: {
            type: DataTypes.STRING,
          },
          isLocallyPinned: {
            type: DataTypes.BOOLEAN,
          },
        });

        await context.createTable("task_schedule", {
          category: {
            type: DataTypes.STRING,
          },
          nextScheduledTime: {
            type: DataTypes.DATE,
          },
          taskType: {
            type: DataTypes.STRING,
          },
        });
      },
      async down({ context }) {
        await context.dropTable("pinned_post");
        await context.dropTable("task_schedule");
      },
    },
    {
      name: "20230826150300-create-automated-post",
      async up({ context }) {
        await context.createTable("automated_post", {
          id: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          category: {
            type: DataType.STRING,
          },
          communityName: {
            type: DataType.STRING,
          },
          cronExpression: {
            type: DataType.STRING,
          },
          timezone: {
            type: DataType.STRING,
          },
          dateFormat: {
            type: DataType.STRING,
          },
          title: {
            type: DataType.STRING,
          },
          body: {
            type: DataType.TEXT,
          },
          isLocallyPinned: {
            type: DataType.BOOLEAN,
          },
          isActive: {
            type: DataType.BOOLEAN,
          },
        });
      },
      async down({ context }) {
        await context.dropTable("automated_post");
      },
    },
  ],
  context: databaseConnection.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: databaseConnection }),
  logger: console,
}).runAsCLI();
