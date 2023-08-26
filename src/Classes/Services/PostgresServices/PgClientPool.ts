import pg from "pg";
import { DatabaseConfiguration } from "../../Database/DatabaseConfiguration.js";

export const pgClientPool = new pg.Pool({
  ...DatabaseConfiguration,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
