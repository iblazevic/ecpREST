'use strict';

var  SwaggerRestify = require('swagger-restify-mw'),
	   restify = require('restify'),
	   app = restify.createServer(),
	   pg = require('pg'),
     db = require(__dirname +'/api/db.js');

module.exports = app; // for testing
 var anyone=[
  '/api/movies/all',
  '/api/user/create',
  '/api/user/login',
  '/api/user/check_mail',
  '/api/user/check_username'
];
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain)
app.use(function(req, res, next) {
  db.checkToken(req.headers['authorization'] || '', function(success, user_id){
    if(success){
      req.user_id=user_id
      next();
    }
    else{
      if(anyone.indexOf(req.path())>-1){
        next();
      }
      else{
        res.json(401);
      }
    }
  })
});
var config = {
  appRoot: __dirname // required config
};

SwaggerRestify.create(config, function(err, swaggerRestify) {
  if (err) { throw err; }

  swaggerRestify.register(app);

  var port = process.env.PORT || 3000;
  app.listen(port);
});
