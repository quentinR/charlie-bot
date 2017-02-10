const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Charlie' });
});

const botBuilder = require('botbuilder')

// Connection to Microsoft Bot Framework
const botConnector = new botBuilder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
})

const bot = new botBuilder.UniversalBot(botConnector)

// Event when Message received
bot.dialog('/', (session) => {
  console.log(session.message.text)
})

router.post('/', botConnector.listen)

module.exports = router;
