var util = require('util'),
    db   = require('../db.js');

module.exports = {
  login     : login,
  checkLogin: checkLogin,
  logout    : logout,
  newUser   : newUser,
  emailFree : emailFree,
  checkMail : checkMail,
  checkUsername : checkUsername
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
  db.logOut(req, function(success, error){
    if(error){
      res.json("Ooops!");
    }
    else{
      res.json("Logged out");
    }
  })
  
}
function checkUsername(req, res){
  console.log(req.swagger.params.username.value)
  db.checkUsername(req.swagger.params.username.value, function(free){
    if(free){
      res.json({msg:'Username free to use'})
    }
    else{
      res.json({msg:'Username already taken'})
    }
  })
}
function checkMail(req, res){
  emailFree(req.swagger.params.email.value, function(free){
    if(free){
      res.json({msg:'Email free to use'})
    }
    else{
      res.json({msg:'Email already registerd'})
    }
  })
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