var util = require('util'),
    db   = require('../db.js');

module.exports = {
  login     : login,
  checkLogin: checkLogin,
  logout    : logout,
  newUser   : newUser,
  emailFree : emailFree
};

function checkLogin(req, res, cb){
  db.checkToken(req, function(success){
    if(success){
      res.json("Authenticated")
    }
    else{
      res.json(401);
    }
  });
}

function login(req, res, next) {
  var creds=JSON.parse(req.swagger.params.creds.value);
  db.logIn(req, creds, function(success, data){
    if(success){
      req.token=data.token;
      res.json({msg:'Success', data:data});
    }
    else{
      res.json({msg:'Bad login'});
    }
  });
}

function logout(req, res){
  res.json("Logged out");
}

function emailFree(email, cb){
  db.checkEmail(email, function(free){
    if(free){
      return cb(true);
    }
    else{
      return cb(false);
    }
  })
}

function newUser(req, res){
  var userData=JSON.parse(req.swagger.params.userData.value);
  emailFree(userData.email, function(free){
    if(free){
      db.createUser(userData, function(success){
        if(success){
          res.json({msg:'Account created successfully, you can log in now'})
        }
        else{
          res.json({msg:'Something went wrong'})
        }
      });
    }
    else{
      res.json({msg:'Email already registered'});
    }
  })
}