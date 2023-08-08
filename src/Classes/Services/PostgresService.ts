import { provide } from "inversify-binding-decorators";
import { pgClientPool as pool } from "./PgClientPool.js";

export type OverduePostPin = {
  postId: number;
  isLocallyPinned: boolean;
};

export type TaskSchedule = {
  category: string;
  nextScheduledTime: Date;
};

@provide(PostgresService)
export class PostgresService {
  async initDBSchema(): Promise<void> {
    const client = await pool.connect();
    try {
      // Initialize schema and tables if not created
      const initDbQuery = `
          CREATE SCHEMA IF NOT EXISTS LemmyBot AUTHORIZATION lemmy;
          CREATE TABLE IF NOT EXISTS LemmyBot.PostPinDuration (postId integer, category varchar(30), remainingDays numeric(4, 0), isLocallyPinned boolean);
          CREATE TABLE IF NOT EXISTS LemmyBot.taskSchedule (category varchar(30), nextScheduledTime timestamptz, taskType varchar(30));
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
    category: string,
    isLocallyPinned: boolean
  ): Promise<void> {
    const client = await pool.connect();
    try {
      const params = [postId, category, isLocallyPinned];
      // specifies how long a post should be pinned
      const setPostPinDurationQuery = `
        INSERT INTO LemmyBot.PostPinDuration (postId, category, isLocallyPinned)
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
        postId: row.postid,
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

  async getScheduledTasks(
    taskType: string
  ): Promise<TaskSchedule[] | undefined> {
    const client = await pool.connect();
    try {
      const params = [taskType];
      const getScheduledTasksQuery = `
        SELECT category, nextScheduledTime FROM LemmyBot.taskSchedules where taskType = $1 and nextScheduledTime <= NOW();
      `;
      const result = await client.query(getScheduledTasksQuery, params);

      const scheduledTasks: TaskSchedule[] = result.rows.map((row) => ({
        category: row.category,
        nextScheduledTime: row.nextscheduledtime,
      }));

      return scheduledTasks;
    } catch (err) {
      console.error("Error: failed to set post for auto removal. ", err);
    } finally {
      client.release();
    }
  }

  async getOverduePosts(
    category: string
  ): Promise<OverduePostPin[] | undefined> {
    const client = await pool.connect();
    try {
      const params = [category];
      const getScheduledTasksQuery = `
        SELECT postId, isLocallyPinned FROM LemmyBot.currentlyPinnedPosts where category = $1;
      `;
      const result = await client.query(getScheduledTasksQuery, params);

      const overduePostPins: OverduePostPin[] = result.rows.map((row) => ({
        postId: row.postid,
        isLocallyPinned: row.islocallypinned,
      }));

      return overduePostPins;
    } catch (err) {
      console.error("Error: failed to set post for auto removal. ", err);
    } finally {
      client.release();
    }
  }

  async clearUnpinnedPosts(postIds: number[]): Promise<void> {
    const client = await pool.connect();
    const param = [postIds];
    try {
      const getScheduledTasksQuery = `
        DELETE FROM LemmyBot.currentlyPinnedPosts WHERE postId ANY($1);
      `;
      await client.query(getScheduledTasksQuery, param);
    } catch (err) {
      console.error("Error: failed to set post for auto removal. ", err);
    } finally {
      client.release();
    }
  }

  async updateTaskSchedule(
    nextScheduledTime: Date,
    category: string
  ): Promise<void> {
    const client = await pool.connect();
    const param = [nextScheduledTime, category];
    try {
      const getScheduledTasksQuery = `
        UPDATE LemmyBot.taskSchedules
        SET nextScheduledTime = $1
        WHERE category = $2;
      `;
      await client.query(getScheduledTasksQuery, param);
    } catch (err) {
      console.error("Error: failed to set post for auto removal. ", err);
    } finally {
      client.release();
    }
  }
}
