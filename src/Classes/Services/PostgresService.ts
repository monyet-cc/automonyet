import { provide } from "inversify-binding-decorators";
import { pgClientPool as pool } from "./PgClientPool.js";

export type OverduePostPin = {
  postId: number;
  isLocallyPinned: boolean;
};

@provide(PostgresService)
export class PostgresService {
  async initDBSchema(): Promise<void> {
    const client = await pool.connect();
    try {
      // Initialize schema and tables if not created
      const initDbQuery = `
          CREATE SCHEMA IF NOT EXISTS LemmyBot AUTHORIZATION lemmy;
          CREATE TABLE IF NOT EXISTS LemmyBot.PostPinDuration (postId integer, remainingDays numeric(4, 0), isLocallyPinned boolean);
        `;
      await client.query(initDbQuery);
    } catch (err) {
      console.error(
        "Error: failed to create schema and tables required for lemmy bot. ",
        err
      );
    } finally {
      client.release();
    }
  }

  async setPostAutoRemoval(
    postId: number,
    remainingDays: number,
    isLocallyPinned: boolean
  ): Promise<void> {
    const client = await pool.connect();
    try {
      const params = [postId, remainingDays, isLocallyPinned];
      // specifies how long a post should be pinned
      const setPostPinDurationQuery = `
        INSERT INTO LemmyBot.PostPinDuration (postId, remainingDays, isLocallyPinned)
        VALUES ($1, $2, $3);
      `;
      await client.query(setPostPinDurationQuery, params);
    } catch (err) {
      console.error("Error: failed to set post for auto removal. ", err);
    } finally {
      client.release();
    }
  }

  async handleOverduePins(): Promise<OverduePostPin[] | undefined> {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // reduce post pin duration by one day
      const updatePostPinDurationQuery = `
          UPDATE LemmyBot.PostPinDuration
          SET remainingDays = (remainingDays - 1)
          WHERE remainingDays > 0;
        `;
      await client.query(updatePostPinDurationQuery);

      // fetch posts that should be unpinned
      const fetchOverduePostPins = `
        SELECT postId, isLocallyPinned
        FROM LemmyBot.PostPinDuration
        WHERE remainingDays <= 0;
      `;
      const result = await client.query(fetchOverduePostPins);

      const deleteOverduePostPins = `
      DELETE FROM LemmyBot.PostPinDuration
      WHERE remainingDays <= 0;
    `;
      await client.query(deleteOverduePostPins);
      await client.query("COMMIT");

      const overduePostPins: OverduePostPin[] = result.rows.map((row) => ({
        postId: Number(row.postid),
        isLocallyPinned: row.islocallypinned,
      }));
      return overduePostPins;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error: failed to handle overdue pinned posts. ", err);
    } finally {
      client.release();
    }
  }
}
