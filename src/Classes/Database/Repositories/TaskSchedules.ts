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

  async getScheduledTasksByTaskType(
    taskType: string
  ): Promise<CreationAttributes<TaskSchedule>[]> {
    const results = await TaskSchedule.findAll({
      where: {
        taskType: taskType,
        nextScheduledTime: { [Op.lte]: Sequelize.fn("NOW") },
      },
    });
    return results.map(
      (task) => task.toJSON() as CreationAttributes<TaskSchedule>
    );
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

  async getAll(): Promise<TaskSchedule[]> {
    return TaskSchedule.findAll();
  }

  async create(
    params: CreationAttributes<TaskSchedule>
  ): Promise<CreationAttributes<TaskSchedule>> {
    const result = await TaskSchedule.create(params);
    return result.toJSON() as CreationAttributes<TaskSchedule>;
  }
}
