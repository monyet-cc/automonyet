# Automoderator (Automonyet) for monyet.cc

###Want to run the bot?

1.  Clone the project using git clone, e.g. clone using ssh

    > git clone git@github.com:monyet-cc/automonyet.git

2.  Set up your env file(refer to .env.example). The bot must be hosted on the same machine where your lemmy instance is hosted.
    PG_HOST is the container name that hosts the postgres service. The BOT_USERNAME and BOT_PASSWORD will be used to login to your instance. It will create a new account if the account doesn't exist.

3.  Create and configure the src/Classes/ValueObjects/PostsToAutomate.json file. Below are the properties you need to configure for the posts.
    Example:
    > [{
        "category": "Daily Chat Thread",
        "communityName": "cafe",
        "body": null,
        "pinLocally": true,
        "cronExpression": "0 0 4 * * *",
        "timezone": "Asia/Kuala_Lumpur",
        "title": "/c/café daily chat thread for $date",
        "dateFormat": "D MMMM YYYY"
    }]

- category: string; //the name of the 'type' of post you want to create.
- communityName: string; //the name of the community you want to post in. the community must exist, or it will throw a community not found error
- body: string | undefined; //the post body. use `` to format your text in multiple lines. markdown input is supported.
- pinLocally: boolean; //whether the post should be pinned locally(true), or only pinned in the community(false).
- cronExpression: string; //the cron expression for when the post should be configured. you can use [crontab](https://crontab.guru/) to generate the expression.
  //however the cron expression requires one more input for seconds, so 0 5 4 \* \* \* would mean every day at 04:05:00.0000000
- timezone: string; //the timezone of the time configured in the cron expression.
- title: string; //the formatted title of the post. write ${date} where you would like to insert your date expression, otherwise just leave it.
- dateFormat: string; //the date's expression. you may refer to sites like [this](https://www.timeanddate.com/date/pattern.html) to get your date format.

4. Deploy the bot in a docker container
   > docker compose up -d
