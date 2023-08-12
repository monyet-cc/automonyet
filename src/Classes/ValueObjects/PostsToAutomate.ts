export type PostToCreate = {
  category: string;
  communityName: string;
  body: string | undefined;
  pinLocally: boolean;
  cronExpression: string;
  timezone: string;
  daysToPin: number; //use zero if pin is not required
  title: string;
  dateFormat: string;
};

export const postsToAutomate: PostToCreate[] = [
  {
    category: "Daily Chat Thread",
    communityName: "cafe",
    body: undefined,
    pinLocally: true,
    cronExpression: "5 0 4 * * *",
    timezone: "Asia/Kuala_Lumpur",
    daysToPin: 1,
    title: `/c/café daily chat thread for $date`,
    dateFormat: "D MMMM YYYY",
  },
  {
    category: "Daily Food Thread",
    communityName: "food",
    body: "Use this thread to share with us what you're having, from breakfast to second breakfast, brunch, lunch, tea time, dinner, supper! Don't be shy, all food are welcome! Image are encouraged!",
    pinLocally: false,
    cronExpression: "5 0 4 * * *",
    timezone: "Asia/Kuala_Lumpur",
    daysToPin: 1,
    title: `Daily c/food Thread - Whatcha Having Today? $date`,
    dateFormat: "Do MMMM, YYYY",
  },
  {
    category: "Weekly Care Thread",
    communityName: "mental_health",
    body: undefined,
    pinLocally: false,
    cronExpression: "5 0 4 * * 1",
    timezone: "Asia/Kuala_Lumpur",
    daysToPin: 7,
    title: `Mental Wellness Weekly Check-in Thread $date`,
    dateFormat: "D MMMM YYYY",
  },
  {
    category: "Weekly Movies Thread",
    communityName: "movies",
    body: "Tell us what you watched this week, whether movie, series, cdrama or Kdrama!",
    pinLocally: false,
    cronExpression: "5 0 4 * * 2",
    timezone: "Asia/Kuala_Lumpur",
    daysToPin: 7,
    title: `What did you watch this week? ($date edition)`,
    dateFormat: "Do MMM YYYY",
  },
  {
    category: "Weekly Reading Thread",
    communityName: "cafe",
    body: "Tell us what you are currently reading, or what's on your reading list!",
    pinLocally: false,
    cronExpression: "5 0 4 * * 4",
    timezone: "Asia/Kuala_Lumpur",
    daysToPin: 7,
    title: `What is your current read? $date`,
    dateFormat: "D MMMM YYYY",
  },
];
