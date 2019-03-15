// BOT SPECIFIC CONFIGURATION
global.PREFIX = '!'; // command prefix
global.BOT_TOKEN = process.env.BOT_TOKEN; // bot token
global.ADMIN = [process.env.ADMIN_ID]; // ids of bot admins

// DATABASE SPECIFIC CONFIGURATION
global.DB_URL = process.env.DB_URL; // url to mongo database
global.DB_USER = process.env.DB_USER; // username for mongo database
global.DB_PASS = process.env.DB_PASS; // password for mongo database

// HEROKU SPECIFIC CONFIGURATION
global.IS_HEROKU_APP = true; // is bot being hosted on heroku
global.APP_URL = process.env.APP_URL; // url to the heroku app
global.PORT = process.env.PORT; // port on which heroku app should listen
