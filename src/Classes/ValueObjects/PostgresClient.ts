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

  static async initPostgresClient(): Promise<PostgresClient> {
    const client = new PostgresClient();

    try {
      await client.connect();
      console.log("Connected to PostgreSQL database");
      return client;
    } catch (err) {
      console.error("Error connecting to PostgreSQL database:", err);
      throw err; // Propagate the error up to the caller if needed
    }
  }
}
