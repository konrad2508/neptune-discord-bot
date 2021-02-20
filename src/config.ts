export default {
  // BOT SPECIFIC CONFIGURATION
  PREFIX: '!', // command prefix
  BOT_TOKEN: process.env.BOT_TOKEN, // bot token
  ADMIN: [process.env.ADMIN_ID], // ids of bot admins

  // DATABASE SPECIFIC CONFIGURATION
  DB_URL: process.env.DB_URL, // url to mongo database
  DB_USER: process.env.DB_USER, // username for mongo database
  DB_PASS: process.env.DB_PASS, // password for mongo database

  // HEROKU SPECIFIC CONFIGURATION
  IS_HEROKU_APP: true, // is bot being hosted on heroku
  APP_URL: process.env.APP_URL, // url to the heroku app
  PORT: process.env.PORT, // port on which heroku app should listen
};
