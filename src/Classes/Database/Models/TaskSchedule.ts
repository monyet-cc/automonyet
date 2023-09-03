import { Column, DataType, Table, Model } from "sequelize-typescript";

@Table({ schema: "lemmyboy", tableName: "task_schedule" })
export class TaskSchedule extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column(DataType.STRING)
  category!: string;

  @Column(DataType.DATE)
  nextScheduledTime!: Date;

  @Column(DataType.STRING)
  taskType!: string;
}
