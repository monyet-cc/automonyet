import { provide } from "inversify-binding-decorators";
import { CreationAttributes } from "sequelize";
import { AutomatedPost } from "../Models/AutomatedPost.js";

@provide(AutomatedPosts)
export class AutomatedPosts {
  async create(
    params: CreationAttributes<AutomatedPost>
  ): Promise<AutomatedPost> {
    return await AutomatedPost.create(params);
  }
}
