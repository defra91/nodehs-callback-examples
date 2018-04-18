'use strict';

const Async = require('async');
const MongoClient = require('mongodb').MongoClient;
const Request = require('request');

Async.auto({
  connectToDb: (cb) => {
    MongoClient.connect('mongodb://localhost:27017/test', (err, db) => {
      if (err) {
        return cb(err);
      }
      console.log('Successfully connected to db');
      return cb(null, db);
    });
  },
  getGithubUser: (cb) => {
    console.log('Retrieving user...');
    let options = {
      url: 'https://api.github.com/users/defra91',
      headers: {
        'User-Agent': 'request'
      }
    };

    Request.get(options, (err, resp, body) => {
      if (err) {
        return cb(err);
      } else {
        return cb(null, JSON.parse(body));
      }
    });
  },
  insertGithubUser: ['connectToDb', 'getGithubUser', (results, cb) => {
    let db = results.connectToDb;
    let dbo = db.db('test');
    let user = results.getGithubUser;
    return dbo.collection('github_users').insertOne(user, cb);
  }]
}, (err) => {
  if (err) {
    console.log('An error occurred');
    console.log(err);
  } else {
    console.log('Successfully added user');
  }
});
