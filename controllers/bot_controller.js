// Graph Database API
const api = require('../api/graph_api') ({
  baseUrl: 'https://prolific-graph-api.herokuapp.com/graphql'
});

function respond(session, replies) {
  if (!Array.isArray(replies)) {
    session.send(replies);
  } else {
    replies.forEach(reply => session.send(reply));
  }
}

function getExperts(session, entities, replies) {
  entities.forEach(entity => {
    api.findTopicExperts(entity.value)
      .then(results => {
        const { topic, department } = results.data;

        if (!topic && !department) {
          respond(session, "Hmm, couldn't find anyone who knows about " + entity.value + ".");
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
            .replace("{$PERSON}", names)
            .replace("${EXPERTISE}", correctedName)
            .replace("{$TEAM}", correctedName)
            .replace("{$DEPARTMENT}", correctedName)
            .replace("{$EXPERTISE}", correctedName);
            respond(session, replyText);
          });
      })
      .catch(() => {
        respond(session, "Who knows?")
      });
  });
}

function processAction(session, res) {
    const action = res.action;
    const replies = res.replies;
    const entities = res.entities

  // Use external services: use res.memory('notion') if you got a notion from this action
  // console.log(res.memory)
  
  console.log(action)
  switch (action.slug) {
    case 'expertise':
      getExperts(session, entities, replies);
      break;
    case 'department':
      getExperts(session, entities, replies);
      break;
    default:
      respond(session, replies);
      break;
  }
}

function processResponse(session, res) {
    const action = res.action;
    const replies = res.replies;

    if (!replies.length) {
      respond(session, 'I didn\'t understand... Sorry :(');
    } else if (action && action.done) {
      processAction(session, res);
    } else {
      respond(session, replies);
    }
}

module.exports.processResponse = processResponse;