export type PostToAutomate = {
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

export const postsToAutomate: PostToAutomate[] = [
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
    body: undefined,
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
];
