import pkg from "cron-parser";
const parseExpression = pkg.parseExpression;
import fs from "fs/promises";

export type PostToCreate = {
  category: string;
  communityName: string;
  body: string | undefined;
  pinLocally: boolean;
  cronExpression: string;
  timezone: string;
  title: string;
  dateFormat: string;
};

export const loadPostsData = async (): Promise<PostToCreate[]> => {
  try {
    // Check if the file exists
    const filePath = "src/Classes/ValueObjects/PostsToAutomate.json";
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      // Return a default value for tests
      if (process.env.NODE_ENV === "test") {
        return [];
      }
      console.error(
        "PostsToAutomate file does not exist. No post schedules will be added."
      );
      return [];
    }

    // Read and parse the data
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading posts data:", error);
    return [];
  }
};

let postsToAutomate: PostToCreate[] = [];

// Load data from the JSON file and populate the postsToAutomate variable
(async () => {
  postsToAutomate = await loadPostsData();
})();

const getCronExpression = (postCategory: string): string => {
  const post = postsToAutomate.find((p) => p.category === postCategory)!;
  return post.cronExpression;
};

export const getPostsToSchedule = (postCategories: string[]) => {
  const postsToSchedule = postsToAutomate.filter(
    (post) => !postCategories.includes(post.category)
  );

  return postsToSchedule;
};

export const getNextScheduledTime = (postCategory: string): Date => {
  const cronExpression = getCronExpression(postCategory);

  const interval = parseExpression(cronExpression);
  return new Date(interval.next().toString());
};

export const getPost = (postCategory: string): PostToCreate => {
  const post = postsToAutomate.find((p) => p.category === postCategory)!;
  return post;
};
