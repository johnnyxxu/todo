
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

// here order matters cookieParser and session have to precede csrf middleware
app.use(express.cookieParser());
app.use(express.session({
  secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9'
}));
app.use(express.csrf());

// process LESS stylesheets into CSS
app.use(require('less-middleware')({
  src: __dirname + '/public',
  compress: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(re, res, next) {
  res.locals._csrf = req.session._csrf;
  return next();
});
app.use(app.router);

if('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.param('task_id', function(req, res, next, taskId) {
  req.db.tasks.findById(taskId, function(error, task){
    if (error) {
      return next(error);
    }

    if (!task) {
      return next(new Error('Task is not found'));
    }

    req.task = task;
    return next();
  });
});

// home page
app.get('/', routes.index);
// todo list page
app.get('/tasks', tasks.list);
app.post('/tasks', tasks.markAllCompleted);
app.post('/tasks', tasks.add);
app.post('/tasks/:task_id', tasks.markAllCompleted);
app.del('/tasks/:task_id', tasks.del);
// completed page
app.get('/tasks/completed', tasks.completed);
// in case something goes wrong
app.all('*', function(req, res) {
  res.send(404);
});
