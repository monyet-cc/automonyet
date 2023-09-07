import { provide } from "inversify-binding-decorators";
import { CreationAttributes } from "sequelize";
import { AutomatedPost } from "../Models/AutomatedPost.js";

interface UpdateAutomatedPost extends CreationAttributes<AutomatedPost> {
  category?: string;
  communityName?: string;
  cronExpression?: string;
  timezone?: string;
  dateFormat?: string;
  title?: string;
  body?: string;
  isLocallyPinned?: boolean;
  isActive?: boolean;
}

@provide(AutomatedPosts)
export class AutomatedPosts {
  async create(
    params: CreationAttributes<AutomatedPost>
  ): Promise<AutomatedPost> {
    return await AutomatedPost.create(params);
  }

  async update(id: number, updateObject: UpdateAutomatedPost) {
    await AutomatedPost.update(updateObject, { where: { id: id } });
  }

  async remove(id: number): Promise<void> {
    await AutomatedPost.destroy({ where: { id: id } });
  }

  async getAllByCommunity(
    community: string
  ): Promise<CreationAttributes<AutomatedPost>[]> {
    const results = await AutomatedPost.findAll({
      where: { communityName: community },
    });
    return results.map(
      (post) => post.toJSON() as CreationAttributes<AutomatedPost>
    );
  }

  async getAll(): Promise<CreationAttributes<AutomatedPost>[]> {
    const results = await AutomatedPost.findAll();
    return results.map(
      (post) => post.toJSON() as CreationAttributes<AutomatedPost>
    );
  }

  async setActive(id: number, active: boolean): Promise<void> {
    await AutomatedPost.update({ isActive: active }, { where: { id: id } });
  }
}
