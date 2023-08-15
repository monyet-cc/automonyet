import { provide } from "inversify-binding-decorators";
import { pgClientPool as pool } from "./PgClientPool.js";
import {
  getNextScheduledTime,
  postsToAutomate,
} from "../ValueObjects/PostsToAutomate.js";

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
          CREATE TABLE IF NOT EXISTS LemmyBot.currentlyPinnedPosts (postId integer, category varchar(30), isLocallyPinned boolean);
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

  async initPostScheduleTasks(): Promise<void> {
    const client = await pool.connect();
    try {
      // Initialize schema and tables if not created
      const getExistingCategoriesQuery = `
        SELECT DISTINCT category
        FROM LemmyBot.taskSchedule
        WHERE taskType = 'postsToAutomate';
      `;
      const result = await client.query(getExistingCategoriesQuery);
      const categories = result.rows.map((row) => row.category);

      const postsToSchedule = postsToAutomate.filter(
        (post) => !categories.includes(post.category)
      );

      const initPostSchedulesQuery = `
        INSERT INTO LemmyBot.taskSchedule (category, nextScheduledTime, taskType)
        VALUES ($1, $2, $3)
        `;

      if (postsToSchedule !== undefined) {
        for (const post of postsToSchedule) {
          const params = [
            post.category,
            getNextScheduledTime(post.category),
            "postsToAutomate",
          ];
          await client.query(initPostSchedulesQuery, params);
        }
      }
    } catch (err) {
      console.error(
        "Error: failed to insert post schedules into database. ",
        err
      );
    } finally {
      client.release();
    }
  }

  async setPostAutoRemoval(
    postId: number,
    postCategory: string,
    isLocallyPinned: boolean
  ): Promise<void> {
    const client = await pool.connect();
    try {
      const params = [postId, postCategory, isLocallyPinned];
      // specifies how long a post should be pinned
      const setPostPinDurationQuery = `
        INSERT INTO LemmyBot.currentlyPinnedPosts (postId, category, isLocallyPinned)
        VALUES ($1, $2, $3);
      `;
      await client.query(setPostPinDurationQuery, params);
    } catch (err) {
      console.error(
        `Error: failed to set post for auto removal for postId ${postId} of category ${postCategory}. `,
        err
      );
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
        SELECT category, nextScheduledTime FROM LemmyBot.taskSchedule where taskType = $1 and nextScheduledTime <= NOW();
      `;
      const result = await client.query(getScheduledTasksQuery, params);

      const scheduledTasks: TaskSchedule[] = result.rows.map((row) => ({
        category: row.category,
        nextScheduledTime: row.nextscheduledtime,
      }));

      return scheduledTasks;
    } catch (err) {
      console.error("Error: failed to get task schedules ", err);
    } finally {
      client.release();
    }
  }

  async getCurrentlyPinnedPosts(
    postCategory: string
  ): Promise<OverduePostPin[] | undefined> {
    const client = await pool.connect();
    try {
      const params = [postCategory];
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
      console.error(
        `Error: failed to get currently pinned posts for category ${postCategory}. `,
        err
      );
    } finally {
      client.release();
    }
  }

  async clearUnpinnedPosts(postCategory: string): Promise<void> {
    const client = await pool.connect();
    const param = [postCategory];
    try {
      const getScheduledTasksQuery = `
        DELETE FROM LemmyBot.currentlyPinnedPosts WHERE category = $1;
      `;
      await client.query(getScheduledTasksQuery, param);
    } catch (err) {
      console.error(
        `Error: failed to delete unpinned post records for post category: ${postCategory} `,
        err
      );
    } finally {
      client.release();
    }
  }

  async updatePostTaskSchedule(
    nextScheduledTime: Date,
    postCategory: string
  ): Promise<void> {
    const client = await pool.connect();
    const param = [nextScheduledTime, postCategory];
    try {
      const getScheduledTasksQuery = `
        UPDATE LemmyBot.taskSchedule
        SET nextScheduledTime = $1
        WHERE category = $2;
      `;
      await client.query(getScheduledTasksQuery, param);
    } catch (err) {
      console.error(
        `Error: failed update the nextscheduled time for the tasks of category ${postCategory}`,
        err
      );
    } finally {
      client.release();
    }
  }
}
