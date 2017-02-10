const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Charlie' });
});

// Connection to Microsoft Bot Framework
const botBuilder = require('botbuilder')
const botConnector = new botBuilder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
})
const bot = new botBuilder.UniversalBot(botConnector)

// Recast
const recast = require('recastai')
const recastClient = new recast.Client(process.env.RECAST_AI)

// Event when Message received
bot.dialog('/', (session) => {
    if(session.message.text.toLowerCase().indexOf("charlie") > -1) {
      recastClient.textRequest(session.message.text)
      // .then(res => console.log(res))
      .then(res => session.send("I'll be able to talk to you soon, promise!"),
                   session.send("I'm still learning 🤓"))
      .catch(() => session.send('I need some sleep right now... Talk to me later!'));
    }
})

/* POST Bot interactions. */
router.post('/', botConnector.listen())

module.exports = router;
