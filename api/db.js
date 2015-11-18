var pg 		= require('pg'),
	connStr = 'postgres://uviluovygcqyek:iGc05LuhQZFOUApKsImha0VxfM@ec2-107-21-222-62.compute-1.amazonaws.com:5432/dejrltg6brj8el',
	//connStr = '',
	md5		= require('md5');

db={
	checkToken: function(token, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('select user_id, token from tokens where token=$1 and logged_out=0',[token], function(e,r){
			client.end();
			if(e){
				cb(false, false);
				client.end()
			}
			else{
				if(r.rows.length>0){
					return cb(true, r.rows[0].user_id);
				}
				else{
					return cb(false, false);
				}
			}
		});
	},
	loadAllMovies:function(user_id, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('select id, name, description as desc, case when user_id=$1 then 1 else 0 end as editable from movies',[user_id], function(e,r){
			client.end()
			if(e){

			}
			else{
				return cb(r);
			}
		});
	},
	loadMyMovies:function(user_id, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('select id, name, description as desc, case when user_id=$1 then 1 else 0 end as editable from movies where user_id=$1 ',[user_id], function(e,r){
			client.end()
			if(e){

			}
			else{
				return cb(r);
			}
		});
	},
	getMovieDetails: function(movId, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('select * from movies where id=$1 ',[movId],function(e,r){
			client.end();
			if(e){
			}
			else{
				return cb(r.rows[0])
			}
			
		});
	},
	checkEmail:function(email, cb){
        var client = new pg.Client(connStr);
        client.connect();
        res=client.query('select user_id from users2 where email=$1 and active=1', [email], function(err, result){
			client.end();
            if(result.rows.length>0){
                return cb(false)
            }
            else{
                return cb(true)
            }
        });
    },
    checkUsername:function(username, cb){
        var client = new pg.Client(connStr);
        client.connect();
        res=client.query('select user_id from users2 where username=$1 and active=1', [username], function(err, result){
			client.end();
            if(result.rows.length>0){
                return cb(false)
            }
            else{
                return cb(true)
            }
        });
    },
    createUser: function(userData, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('insert into users2 (username, password, email, active) values ($1,$2, $3, 1)',[userData.username, md5(userData.password), userData.email], function(e,r){
			client.end();
			if(e){
				return cb(false);
			}
			else{		
				return cb(true);
			}
		});
	},
	createMovie: function(data, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('insert into movies (name, description, user_id) values ($1, $2, $3)',[data.name, data.desc, data.user_id],function(e,r){
			if(e){
				return cb(e)
			}
			else{
				client.query('SELECT currval(\'movies_id_seq\')',function(e2,r2){
					client.end()
					if(e2){

					}
					cb(r2.rows[0].currval)
				});
			}
		});
	},

	editMovie:function(req, cb){
	var client = new pg.Client(connStr),
		movId = req.swagger.params.movId.value,
      	props = req.swagger.params.props.value;
    client.connect();
    client.query('select * from movies where id=$1 and user_id=$2', [movId, req.user_id], function(e, r){
    	if(e){
    		client.end()
    		return cb(false, e)
    	}
    	else if(r.rows.length>0){
    		client.query('update movies set name=$1, description=$2 where id=$3',[props.props.name, props.props.description, movId], function(err, res){
    			client.end()
    			if(e){
    				return cb(false, e)
    			}
    			else{
    				cb(true, 'Movie updated')
    			}
    		})
    	}
    	else{
    		client.end()
    		return cb(false, 'Not an owner');
    	}
    })

      	
	},

	logIn:function(req, creds, cb){
        var client = new pg.Client(connStr);
        client.connect();
        res=client.query('select username, user_id, email from users2 where username=$1 and password=$2 and active=1 limit 1',[creds.username, md5(creds.password)],function(err, result){
            if(result.rows.length>0){
        		var data = result.rows[0];
        		var date = new Date()
        		data.token = md5(''+data.user_id+date);
        		res2 = client.query('insert into tokens (token, user_id, logged_out) values($1, $2, 0)', [data.token, data.user_id], function(err, res){
					client.end();
        			if(err){
        				return cb(false, err)
        			}
        			else{
						return cb(true, data)
        			}
        		})
            }
            else{
                //client.query('insert into neuspjesni_login (lastcheck, ip) values(now()::TIMESTAMP WITHOUT TIME ZONE,$1)',[a]);
                callback(false, false);
            }
        });
    }

}
module.exports=db;