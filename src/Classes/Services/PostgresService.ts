import { provide } from "inversify-binding-decorators";
import { PostgresClient } from "../ValueObjects/PostgresClient.js";

@provide(PostgresService)
export class PostgresService {
  constructor(private client: PostgresClient) {}

  public initDB = async () => {
    try {
      await this.client.connect();

      // Initialize schema and tables if not created
      const initDbQuery = `
          CREATE SCHEMA IF NOT EXISTS LemmyBot AUTHORIZATION lemmy;
          CREATE TABLE IF NOT EXISTS PostPinDuration (postId integer, remainingDays numeric(4, 0), isLocallyPinned boolean);
        `;
      await this.client.query(initDbQuery);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      await this.client.end();
    }
  };

  public setPostAutoRemoval = async (
    postId: number,
    remainingDays: number,
    isLocallyPinned: boolean
  ) => {
    try {
      await this.client.connect();
      const params = [postId, remainingDays, isLocallyPinned];
      // specifies how long a post should be pinned
      const setPostPinDurationQuery = `
        INSERT INTO PostPinDuration (postId, remainingDays, isLocallyPinned)
        VALUES ($1, $2, $3);
      `;
      await this.client.query(setPostPinDurationQuery, params);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      await this.client.end();
    }
  };

  public fetchOverduePins = async () => {
    try {
      const pinsToRemove = await this.handleOverduePins();

      //if able to fetch pins to remove successfully, proceed with deletion
      if (!pinsToRemove) {
        const deleteOverduePostPins = `
        DELETE FROM PostPinDuration
        WHERE remainingDays <= 0;
      `;
        await this.client.query(deleteOverduePostPins);
      }

      return pinsToRemove;
    } catch (err) {
      console.error("Error:", err);
    } finally {
      await this.client.end();
    }
  };

  public handleOverduePins = async () => {
    try {
      await this.client.connect();

      // reduce post pin duration by one day
      const updatePostPinDurationQuery = `
          UPDATE PostPinDuration
          SET remainingDays = (remainingDays - 1)
          WHERE remainingDays > 0;
        `;
      await this.client.query(updatePostPinDurationQuery);

      // fetch posts that should be unpinned
      const fetchOverduePostPins = `
        SELECT postId, isLocallyPinned
        FROM PostPinDuration
        WHERE remainingDays <= 0;
      `;
      const result = await this.client.query(fetchOverduePostPins);
      return result.rows;
    } catch (err) {
      console.error("Error:", err);
    } finally {
      await this.client.end();
    }
  };
}
