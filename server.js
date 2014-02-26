
var express = require('express');
var models = require('./models');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var auth = require('./authentication.js');
var sharejs = require('share').server;
var utils = require('./utils');

var rtg;
var redis;
if (process.env.REDISTOGO_URL) {
  rtg = require('url').parse(process.env.REDISTOGO_URL);
  redis = require('redis').createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(':')[1]);  
} else {
  rtg = {
    hostname: null,
    port: null,
    auth: ''
  };
  redis = require('redis').createClient(6379, 'localhost');
}
var RedisStore = require('connect-redis')(express);
var sessionStore = new RedisStore({client: redis});

//set up server
var port = Number(process.env.PORT || 5000);;
app = express();

//attach share JS server to app
var options = {
  db: {
    type: 'redis',
    hostname: rtg.hostname,
    port: rtg.port,
    auth: rtg.auth.split(':')[1] || null
  },
  browserChannel: {
    cors: "*"
  }
};

sharejs.attach(app, options);

app.listen(port);
console.log('Listening on port ' + port);  

//sets up templating engine as jade
app.engine('jade', require('jade').__express);

//configures static asset delivery
app.use(express.static(__dirname + '/public'));

//configures passport js
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({
  secret: process.env.CLIENT_SECRET  || 'cats4life',
  store: sessionStore
}));
app.use(passport.initialize())
app.use(passport.session());

passport.serializeUser(function(user, done) {
 done(null, user._id);
});

passport.deserializeUser(function(id, done) {
 models.User.findById(id, function(err, user){
     if(!err) done(null, user);
     else done(err, null)
 })
});


//-------------------------LOG IN ROUTES -----------------------------//
app.set('user', null);

app.get('/log_in', function(req, res) {
  res.render('users/log_in.jade');
})

app.get('/sign_up', function(req, res) {
  models.School.find().exec(function(err, schools) {
    res.render('users/sign_up.jade', {schools: JSON.stringify(schools)});
  });
})

app.get('/log_out', function(req, res) {
  req.logout();
  app.set('user', null);
  app.set('name', null);
  res.redirect('/log_in');
});

//FB routes
app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/log_in' }),
  function(req, res) {
    app.set('user', req.user);
    app.set('name', app.get('user').first_name + " " + app.get('user').last_name);
    req.user.email ? res.redirect('/') : res.redirect('/sign_up?id='+req.user.id);
  });

//----------------------PAGES--------------------------//

var pages = require('./pages');
var api = require('./api');
