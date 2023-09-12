# Automoderator (Automonyet) for monyet.cc

###Want to run the bot?

1.  Clone the project using git clone, e.g. clone using ssh

    > git clone git@github.com:monyet-cc/automonyet.git

1.5 We have now migrated the bot's database into mysql. You need to run a mysql container that runs within the same docker network as the other lemmy containers.
    For example, you need to add the following into Lemmy's docker-compose file:

    mysql:
        image: mysql:latest  
        environment:
          MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}  
          MYSQL_DATABASE: ${MYSQL_DATABASE}  
          MYSQL_USER: ${MYSQL_USER}  
          MYSQL_PASSWORD: ${MYSQL_PASSWORD}  
        ports:
          - "${MYSQL_PORT}:3306"
        volumes:
          - ./volumes/mysql:/var/lib/mysql 


and configure and env file with the following variables: (you may change the database name and user)

        MYSQL_ROOT_PASSWORD=
        MYSQL_DATABASE=lemmybot
        MYSQL_USER=MonyetBot
        MYSQL_PASSWORD=
        MYSQL_PORT=3306

2.  Set up your env file(refer to .env.example). The bot must be hosted on the same machine where your lemmy instance is hosted.
    The BOT_USERNAME and BOT_PASSWORD will be used to login to your instance. It will create a new account if the account doesn't exist.
    example database configuration:
    
        DATABASE_DIALECT=mysql
        DATABASE_HOST=monyet-mysql-1
        DATABASE_PORT=3306
        DATABASE_NAME=lemmybot
        DATABASE_USER=MonyetBot
        DATABASE_PASSWORD=

4.  Create and configure the src/Classes/ValueObjects/PostsToAutomate.json file. Below are the properties you need to configure for the posts.
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
