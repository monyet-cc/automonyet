# Automoderator (Automonyet) for monyet.cc

###Want to run the bot?
1. Clone the project using git clone, e.g. 
> git clone git@github.com:monyet-cc/automonyet.git

2. Set up your env file(refer to .env.example). 
PG_HOST is the container name that hosts the postgres service. The BOT_USERNAME and BOT_PASSWORD will be used to login to your instance. It will create a new account if the account doesn't exist.

3. Configure the src/Classes/ValueObjects/PostsToAutomate file. Below are the properties you need to configure for the posts.
category: string; //the name of the 'type' of post you want to create. 
communityName: string; //the name of the community you want to post in. the community must exist, or it will throw a community not found error
body: string | undefined; //the post body. use `` to format your text in multiple lines. markdown input is supported.
pinLocally: boolean; //whether the post should be pinned locally(true), or only pinned in the community(false).
cronExpression: string; //the cron expression for when the post should be configured. you can use [crontab](https://crontab.guru/) to generate the expression.
                        //however the cron expression requires one more input for seconds, so 0 5 4 * * * would mean every day at 04:05:00.0000000
timezone: string; //the timezone of the time configured in the cron expression.
title: string; //the formatted title of the post. write ${date} where you would like to insert your date expression, otherwise just leave it.
dateFormat: string; //the date's expression. you may refer to sites like [this](https://www.timeanddate.com/date/pattern.html) to get your date format.

4. Deploy the bot in a docker container
> docker compose up -d


