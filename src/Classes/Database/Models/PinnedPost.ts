import { Column, DataType, Table } from "sequelize-typescript";
import { Model } from "sequelize";

@Table({ tableName: "pinned_post" })
export class PinnedPost extends Model<PinnedPost> {
  @Column(DataType.INTEGER)
  postId!: string;

  @Column(DataType.STRING)
  category!: string;

  @Column(DataType.BOOLEAN)
  isLocallyPinned!: boolean;
}
