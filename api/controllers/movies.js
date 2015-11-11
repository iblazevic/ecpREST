var util = require('util'),
    db   = require('../db.js');

module.exports = {
  all:    getAll,
  mine:   getMine,
  single: getSingle,
  edit:   editSingle,
  create: create,
};

function getAll(req, res) {
  if(req.user_id){
    user_id=req.user_id
  }
  else{
    user_id=-1
  }
  db.loadAllMovies(user_id, function(res1){
    res.json(res1.rows);
  });
}

function getMine(req, res) {
  db.loadMyMovies(req.user_id, function(res1){
    res.json(res1.rows);
  });
}

function getSingle(req, res) {
  var movId = req.swagger.params.movId.value;
  db.getMovieDetails(movId,function(mov, detail){
    res.json(mov, detail);
  });
}

function editSingle(req, res) {
  var movId = req.swagger.params.movId.value,
      props = req.swagger.params.props.value;
  db.editMovie(movId,function(mov, detail){
    res.json(mov, detail);
  });
}

function create(req, res){
  if(req.UserData.user_id){
    props = req.swagger.params.props.value;
    props.user_id = req.UserData.user_id;
    db.createMovie(props, function(movId){
      db.getMovieDetails(movId, function(mov, detail){
        res.json(mov, detail);
      });
    })
  }
  else{
    res.json(401)
  }
}