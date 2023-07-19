import { Client } from "pg";

export class PostgresClient extends Client {
  constructor() {
    super({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: 5432,
    });
  }

  static initPostgresClient(): PostgresClient {
    return new PostgresClient();
  }
}
