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

  // CALL TO RECAST.AI: session.message.address.conversation.id contains a unique ID of your conversation with the channel used
  // The conversationToken is what lets Recast.AI identify your conversation.
  // As session.message.address.conversation.id is what identifies your conversation with the channel used, you can use it as conversationToken.

  recastClient.textConverse(text, { conversationToken: session.message.address.conversation.id })
  .then((res) => {
    // console.log("res = ")
    // console.log(res)
    const action = res.action;
    // console.log("action = ")
    // console.log(action)
    const intents = res.intents;
    console.log("intents = ")
    console.log(intents)
    const entities = res.entities
    console.log("entities = ")
    console.log(entities)
    const replies = res.replies;
    // console.log("replies = ")
    // console.log(replies)

    if (!replies.length) {
      session.send('I didn\'t understand... Sorry :(')
      return
    }

    if (action && action.done) {
      // Use external services: use res.memory('notion') if you got a notion from this action
    }

    if (entities.length > 0) {
      let entity = entities[entities.length-1]
      if (entity.name == 'greeting') {
        replies.forEach(reply => session.send(reply));
      } else {
        api.findTopicExperts(entity.value)
      .then(results => {
        console.log(results.data)
        const { topic, department } = results.data;

        if (!topic && !department) {
          session.send(`Hmm, couldn't find anyone.`);
          return;
        }

        const peopleNames = []
          .concat(topic? topic.expertises.map(expertise => expertise.person): [])
          .concat(department? department.people: [])
          .map(({ firstName, lastName }) => `${firstName} ${lastName}`);

        let names = '';

        peopleNames.forEach((value, i) => {
          if (peopleNames.length === 0) {
            names = "Nobody"
          } else if (peopleNames.length == 1) {
            names = value
          } else if (peopleNames.length == 2) {
            if (i == 0) {
              names += value
            } else {
              names += " and " + value
            }
          } else if (peopleNames.length > 2) {
            if (i == 0) {
              names += value
            } else if (i == peopleNames.length - 1) {
              names += " and " + value
            } else {
              names += ", " + value
            }
          }
        });

        let correctedName;

        if (topic) {
          correctedName = topic.name;
        } else if (department) {
          correctedName = department.name;
        }

        replies.forEach(reply => {
          const replyText = reply
            .replace("${PERSON}", names)
            .replace("${TEAM}", correctedName)
            .replace("${DEPARTMENT}", correctedName)
            .replace("${EXPERTISE}", correctedName)
            .replace("{$PERSON}", names)
            .replace("{$TEAM}", correctedName)
            .replace("{$DEPARTMENT}", correctedName)
            .replace("{$EXPERTISE}", correctedName);

          session.send(replyText);
        });
      })
      .catch(() => {
        session.send('Nobody!?')
      });
      }
    } else {
      replies.forEach(reply => session.send(reply));
    }
  })
  .catch(() => {
    session.send('I need some sleep right now... Talk to me later!')
  });
});

/* POST Bot interactions. */
router.post('/', botConnector.listen())

module.exports = router;
