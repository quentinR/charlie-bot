'use strict';

const P = require('bluebird');
const request = require('request');
const requestAsync = options => {
  return P.fromCallback(callback => {
    request(options, callback);
  });
};

const SDK = module.exports = ({
  baseUrl
}) => {
  const sendQuery = query => {
    return requestAsync({
      method: 'GET',
      json: true,
      uri: baseUrl,
      qs: { query }
    });
  };

  const findTopicExperts = topicName => {
    return sendQuery(`
      query {
        topic(name:"${topicName}") {
          name
          expertises {
            confidence
            person {
              uuid
              firstName
              lastName
            }
          }
        }
        department(name:"${topicName}") {
          uuid
          name
          people {
            uuid
            firstName
            lastName
          }
        }
      }
    `).get('body');
  };

  return {
    sendQuery,
    findTopicExperts
  };
};