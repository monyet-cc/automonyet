import { Column, DataType, Table, Model } from "sequelize-typescript";

@Table({ tableName: "pinned_post" })
export class PinnedPost extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id!: number;

  @Column(DataType.INTEGER)
  postId!: string;

  @Column(DataType.STRING)
  category!: string;

  @Column(DataType.BOOLEAN)
  isLocallyPinned!: boolean;
}
