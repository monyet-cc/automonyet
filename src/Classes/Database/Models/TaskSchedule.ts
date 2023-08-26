import { Model } from "sequelize";
import { Column, DataType, Table } from "sequelize-typescript";

@Table({ tableName: "task_schedule" })
export class TaskSchedule extends Model<TaskSchedule> {
  @Column(DataType.STRING)
  category!: string;

  @Column(DataType.DATE)
  nextScheduledTime!: Date;

  @Column(DataType.STRING)
  taskType!: string;
}
