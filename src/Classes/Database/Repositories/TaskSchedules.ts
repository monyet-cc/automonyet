import { TaskSchedule } from "../Models/TaskSchedule.js";
import { CreationAttributes, Op, Sequelize } from "sequelize";
import { provide } from "inversify-binding-decorators";

@provide(TaskSchedules)
export class TaskSchedules {
  async getCategoriesByTaskType(taskType: string): Promise<string[]> {
    const results = await TaskSchedule.findAll({
      where: { taskType: taskType },
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("category")), "category"],
      ],
      raw: true, // Fetch raw data without Sequelize model instances
    });
    return results.map((result) => result.category);
  }

  async getScheduledTasksByTaskType(taskType: string): Promise<TaskSchedule[]> {
    return await TaskSchedule.findAll({
      where: {
        taskType: taskType,
        nextScheduledTime: { [Op.lte]: Sequelize.fn("NOW") },
      },
    });
  }

  async create(
    params: CreationAttributes<TaskSchedule>
  ): Promise<TaskSchedule> {
    return await TaskSchedule.create(params);
  }

  async setNextScheduledTimeByCategory(
    nextScheduledTime: Date,
    category: string
  ): Promise<void> {
    await TaskSchedule.update(
      { nextScheduledTime: nextScheduledTime },
      { where: { category: category } }
    );
  }
}
