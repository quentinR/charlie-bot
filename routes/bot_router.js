const express = require('express');
const router = express.Router();
const request = require('request');
const api = require('../graph-api') ({
  baseUrl: 'https://prolific-graph-api.herokuapp.com/graphql'
});

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
    const user = session.message.address.user.name;
    var conversation = session.message.address.conversation.name;
    if (!conversation) {
      conversation = "a direct message"
    } else {
      conversation = "#" + conversation
    }
    const answer = "I'm talking with @" + user + "  in " + conversation;
    session.send(answer);
    // console.log("res = ")
    // console.log(res)
    // const action = res.action;
    // console.log("action = ")
    // console.log(action)
    // const intents = res.intents;
    // console.log("intents = ")
    // console.log(intents)
    // const entities = res.entities
    // console.log("entities = ")
    // console.log(entities)
    // const replies = res.replies;
    // console.log("replies = ")
    // console.log(replies)

    // if (!replies.length) {
    //   session.send('I didn\'t understand... Sorry :(')
    //   return
    // }
    // replies.forEach(reply => session.send(reply));
  })
  .catch(() => {
    session.send('I need some sleep right now... Talk to me later!')
  });
});

/* POST Bot interactions. */
router.post('/', botConnector.listen())

module.exports = router;
