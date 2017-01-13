
const express = require('express');
const http = require('http');
const path = require('path');
const mongoskin = require('mongoskin');
// access to our own modules
const routes = require('./routes');
const tasks = require('./routes/tasks');

// connect to db
var db = mongoskin.db('mongodb://localhost:27017/todo', {safe:true});
var app = express();

app.use(function(req, res, next) {
  req.db = {};
  req.db.tasks = db.collection('tasks');
  next();
});

app.locals.appname = 'Todo List';
app.set('port', process.env.PORT || 3000);
// template files
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
