const express = require('express');
const router = express.Router();
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
// Bot controller
const botController = require('../controllers/bot_controller')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Charlie' });
});

// Event when Message received
bot.dialog('/', (session) => {
  const text = session.message.text
  const conversationChannel = session.message.address.conversation.name
  if (conversationChannel && !text.toLowerCase().includes('charlie')) {
    return
  }

  // CALL TO RECAST.AI: session.message.address.conversation.id contains a unique ID of your conversation with the channel used
  // The conversationToken is what lets Recast.AI identify your conversation.
  // As session.message.address.conversation.id is what identifies your conversation with the channel used, you can use it as conversationToken.

  recastClient.textConverse(text, { conversationToken: session.message.address.conversation.id })
  .then((res) => {
    botController.processResponse(session, res)
  })
  .catch((err) => {
    console.log(err)
    session.send('I need some sleep right now... Talk to me later!')
  });
});

/* POST Bot interactions. */
router.post('/', botConnector.listen())

module.exports = router;
