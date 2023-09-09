import * as dotenv from "dotenv";
import { Dialect } from "sequelize";

dotenv.config();

export const DatabaseConfiguration = {
  username: process.env.DATABASE_USER || "username",
  password: process.env.DATABASE_PASSWORD || "password",
  host: process.env.DATABASE_HOST || "127.0.0.1",
  port: Number(process.env.DATABASE_PORT || 0),
  database: process.env.DATABASE_NAME || "database",
  type: (process.env.DATABASE_DIALECT || "postgres") as Dialect,
};
