var express      = require('express');
var app          = module.exports = express();
var path         = require('path');
var mysql        = require('mysql'); // node-mysql module
var myConnection = require('./custom_modules/custom-express-myconnection');
//var jwt          = require('jsonwebtoken');

var config       = require('./conf');

var middlewares  = require('./middlewares');
var routes       = require('./routes/index');
var api          = require('./routes/api');
var admin        = require('./routes/admin'); 
var client       = require('./routes/client');
var commercial       = require('./routes/commercial');
var magasinier       = require('./routes/magasinier');

// connexion à la DB
app.use(myConnection(mysql, config.mysql, 'single'));

app.set('secret', config.security.secret);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares setup
middlewares(app);

// Routing setup
app.use('/', routes);
app.use('/', api);
app.use('/admin/', admin);
app.use('/client/', client);
app.use('/commercial/', commercial);
app.use('/magasinier/', magasinier);

/*-----------------------------------------------------*
|------------------- ERROR HANDLING -------------------|
*-----------------------------------------------------*/

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

  app.use('/api', function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    return res.json({
      message: err.message,
      error: err
    });
  });

  app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use('/api', function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
    return res.json({
      message: err.message,
      error: {}
    });
});

app.use(function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
