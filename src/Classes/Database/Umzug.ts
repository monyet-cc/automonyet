import { SequelizeStorage, Umzug } from "umzug";
import { Sequelize } from "sequelize-typescript";
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
            allowNull: false,
          },
          category: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          isLocallyPinned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
          },
        });

        await context.createTable("task_schedule", {
          category: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          nextScheduledTime: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          taskType: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
          },
        });
      },
      async down({ context }) {
        await context.dropTable("pinned_post");
        await context.dropTable("task_schedule");
      },
    },
  ],
  context: databaseConnection.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: databaseConnection }),
  logger: console,
}).runAsCLI();
