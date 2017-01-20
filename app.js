
// module dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const mongoskin = require('mongoskin');
// access to our own modules
const routes = require('./routes');
const tasks = require('./routes/tasks');
const favicon = require('express-favicon');
const logger = require('morgan');
const methodOverride = require('method-override');
const session = require('express-session');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const cookieParser = require('cookie-parser');

// connect to db
var db = mongoskin.db('mongodb://localhost:27017/todo', {safe:true});
var app = express();

app.use(function(req, res, next) {
  req.db = {};
  req.db.tasks = db.collection('tasks');
  next();
});

// set up all environments
app.locals.appname = 'Todo List';
app.set('port', process.env.PORT || 3000);
// template files
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());

// here order matters cookieParser and session
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9'
}));

// process LESS stylesheets into CSS
app.use(require('less-middleware')({
  src: __dirname + '/public',
  compress: true
}));
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.Router());

// development only
if('development' == app.get('env')) {
  app.use(errorHandler());
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
app.post('/tasks/:task_id', tasks.markCompleted);
app.del('/tasks/:task_id', tasks.del);
// completed page
app.get('/tasks/completed', tasks.completed);
// in case something goes wrong
app.all('*', function(req, res) {
  res.send(404);
});

http.createServer(app).listen(app.get('port'),
  function(){
    console.log('Express is listening on ' + app.get('port'));
  });
