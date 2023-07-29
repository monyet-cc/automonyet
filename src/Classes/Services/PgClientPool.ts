import pg from "pg";
import { pgClientConfig } from "../ValueObjects/PostgresClientConfiguration.js";

export const pgClientPool = new pg.Pool({
  ...pgClientConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
