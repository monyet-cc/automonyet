import { Client } from "pg";

export class PostgresClient extends Client {
  constructor() {
    super({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: Number(process.env.PG_PORT),
    });
  }

  static initPostgresClient(): PostgresClient {
    return new PostgresClient();
  }
}
