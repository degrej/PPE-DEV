var express     = require('express');
var app         = module.exports = express();
var path        = require('path');
var favicon     = require('serve-favicon');
var logger      = require('morgan');
var cookieParser= require('cookie-parser');
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken');
var config      = require('./conf');

// connexion à la DB
var mysql = require('mysql'), // node-mysql module
    myConnection = require('express-myconnection'), // express-myconnection module
    dbOptions = {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'jismen'
    };
  
app.use(myConnection(mysql, dbOptions, 'single'));

mongoose.connect(config.db, function(err){
  if (err){
    console.log('Erreur de connexion : ' + err);
  } else {
    console.log('Connexion à jismen : ok !');
  }
});
app.set('secret', config.secret)

var routes  = require('./routes/index');
var api     = require('./routes/api');
var admin   = require('./routes/admin');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api/', api);
app.use('/admin/', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
