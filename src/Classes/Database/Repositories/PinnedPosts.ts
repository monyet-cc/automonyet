import { provide } from "inversify-binding-decorators";
import { PinnedPost } from "../Models/PinnedPost.js";
import { CreationAttributes } from "sequelize";

@provide(PinnedPosts)
export class PinnedPosts {
  async getByCategory(category: string): Promise<PinnedPost[]> {
    return await PinnedPost.findAll({ where: { category: category } });
  }

  async create(params: CreationAttributes<PinnedPost>): Promise<PinnedPost> {
    return await PinnedPost.create<PinnedPost>(params);
  }

  async removeByCategory(category: string): Promise<void> {
    await PinnedPost.destroy({ where: { category: category } });
  }
}
