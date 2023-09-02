import { provide } from "inversify-binding-decorators";
import { PinnedPost } from "../Models/PinnedPost.js";
import { CreationAttributes } from "sequelize";

@provide(PinnedPosts)
export class PinnedPosts {
  async getByCategory(
    category: string
  ): Promise<CreationAttributes<PinnedPost>[]> {
    const results = await PinnedPost.findAll({ where: { category: category } });
    return results.map(
      (post) => post.toJSON() as CreationAttributes<PinnedPost>
    );
  }

  async create(params: CreationAttributes<PinnedPost>): Promise<PinnedPost> {
    return await PinnedPost.create(params);
  }

  async removeByCategory(category: string): Promise<void> {
    await PinnedPost.destroy({ where: { category: category } });
  }
}
