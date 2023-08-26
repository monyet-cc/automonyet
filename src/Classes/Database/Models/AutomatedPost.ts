import { Column, DataType, Table } from "sequelize-typescript";
import { Model } from "sequelize"; //    > [{

@Table({ tableName: "automated_post" })
export class AutomatedPost extends Model<AutomatedPost> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column(DataType.STRING)
  category!: string;

  @Column(DataType.STRING)
  communityName!: string;

  @Column(DataType.STRING)
  cronExpression!: string;

  @Column(DataType.STRING)
  timezone!: string;

  @Column(DataType.STRING)
  dateFormat!: string;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  body!: string;

  @Column(DataType.BOOLEAN)
  isLocallyPinned!: boolean;

  @Column(DataType.BOOLEAN)
  isActive!: boolean;
}
