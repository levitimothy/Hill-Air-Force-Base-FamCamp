var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// added after initial clone
var guestdash = require('./routes/guestdash');
var userlogin = require('./routes/userlogin.js');
var makereservation = require('./routes/makereservation');
var map = require('./routes/map');
var staffdash = require('./routes/staffdash');
// adding register page - levi
var registerRouter = require('./routes/register');
var availableRouter = require('./routes/available');
var resHistory = require('./routes/reshistory');
var guestHistory = require('./routes/guesthistory');
var reservationsToday = require('./routes/restoday');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist/')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/icons/')));
app.use(express.static(path.join(__dirname, "node_modules/crypto-js/")));

var dbCon = require('./lib/database')

// Session management to store cookies in a MySQL server (this has a bug, so we assist it by creating the database for it)
var dbSessionPool = require('./lib/sessionPool.js');
var sessionStore = new MySQLStore({}, dbSessionPool);
// Necessary middleware to store session cookies in MySQL
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret1234',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  cookie : {
    sameSite: 'strict'
  }
}));

// Middleware to make session variables available in .ejs template files
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
// added after initial clone
app.use('/guestdash', guestdash);
app.use('/userlogin', userlogin);
app.use('/makereservation', makereservation);
app.use('/map', map);
app.use('/staffdash', staffdash);
// for url to register page - levi
app.use('/register', registerRouter);
app.use('/available', availableRouter);
app.use('/reshistory', resHistory);
app.use('/guesthistory', guestHistory);
app.use('/restoday', reservationsToday);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
