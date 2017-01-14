
// returns list of incomplete tasks
exports.list = function(req, res, next) {
  req.db.tasks.find({
    completed: false
  }).toArray(function(error, tasks){
    if(error){
      return next(error);
    }

    res.render('tasks', {
      title: 'todo list',
      tasks: tasks || []
    });
  });
};

exports.add = function(req, res, next) {
  if (!req.body || !req.body.name) {
    return next(new Error('No data provided'));
  }

  req.db.tasks.save({
    name: req.body.name,
    completed: false
  }, function(error, tasks) {
    if (error) {
      return next(error);
    }

    if(!task) {
      return next(new Error('Failed to save'));
    }

    console.info('Added %s with id=%s', task.name, task._id);
    res.redirect('/tasks');
  });
};

// make all the tasks as completed
export.markAllCompleted = function(req, res, next) {
  if (!req.body.all_done || req.body.all_done !== 'true') {
    return next();
  }

  req.db.tasks.update({
    completed: false
  }, {$set: {
    completed: true
  }}, {multi: true}, function(error, count) {
    if (error) return next(error);
    console.info('Marked %s tasks completed', count);
    res.redirect('/tasks');
  }
  })
};

// get all the completed list
exports.completed = function(req, res, next) {
  req.db.tasks.find({
    completed: true
  }).toArray(function(error, tasks) {
    res.render('tasks_completed', {
      title: 'completed',
      tasks: tasks || []
    });
  });
};

// mark a task as completed
exports.markCompleted = function (req, res, next) {
  if (!req.body.completed)
    return next(new Error('Param is missing'));

  req.db.tasks.updateById(req.task._id, {
    $set: {completed: req.body.completed === 'true'}},
    function(error, count) {
      if (error) return next(error);
      if (count !== 1)
        return next(new Error('the count is not 1'));
      console.info('Marked task %s with id=%s completed',
                  req.task.name,
                  req.task._id);
      res.redirect('/tasks');
    }
  )
};

// delete task
exports.del = function(req, res, next) {
  req.db.tasks.removeById(req.task._id, function(error, count) {
      if (error) return next(error);
      if (count !==1) return next(new Error('count is not 1'));
      console.info('Deleted task %s with id=%s completed.',
        req.task.name,
        req.task._id);
      res.send(200);
  });
};
