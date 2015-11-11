var pg 		= require('pg'),
	connStr = 'postgres://postgres:cinjok123@localhost:5434/plur_nova',
	md5		= require('md5');

db={
	checkToken: function(token, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('select user_id, token from tokens where token=$1 and logged_out=0',[token], function(e,r){
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
        		client.end()
			}
		});
	},
	loadAllMovies:function(user_id, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('select id, name, description as desc, case when user_id=$1 then 1 else 0 end as editable from movies',[user_id], function(e,r){
			if(e){

			}
			else{
				return cb(r);
			}
        	client.end()
		});
	},
	loadMyMovies:function(user_id, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('select id, name, description as desc, case when user_id=$1 then 1 else 0 end as editable from movies where user_id=$1 ',[user_id], function(e,r){
			if(e){

			}
			else{
				return cb(r);
			}
        	client.end()
		});
	},
	getMovieDetails: function(movId, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('select * from movies where id=$1 ',[movId],function(e,r){
			if(e){
			}
			else{
				return cb(r.rows[0])
			}
        	client.end()
			
		});
	},
	checkEmail:function(email, cb){
        var client = new pg.Client(connStr);
        client.connect();
        res=client.query('select user_id from users2 where email=\''+email+'\' and active=1',function(err, result){
            if(result.rows.length>0){ 
                return cb(false)
            }
            else{
                //client.query('insert into neuspjesni_login (lastcheck, ip) values(now()::TIMESTAMP WITHOUT TIME ZONE,$1)',[a]);
                return cb(true)
            }
        	client.end()
        });
    },
    createUser: function(userData, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('insert into users2 (username, password, email, active) values ($1,$2, $3, 1)',[userData.username, md5(userData.password), userData.email], function(e,r){
			if(e){
				return cb(false);
			}
			else{		
				return cb(true);
			}
        	client.end()
		});
	},
	createMovie: function(data, cb){
		var client = new pg.Client(connStr);
		client.connect()
		client.query('insert into movies (name, description, actors, user_id) values ($1, $2, $3, $4)',[data.name, data.desc, data.actors, data.user_id],function(e,r){
			if(e){
				return cb(e)
			}
			else{
				id=client.query('SELECT currval(\'movies_id_seq\')',function(e2,r2){
					if(e2){

					}
					cb(r2.rows[0].currval)
				});
			}
        	client.end()
		});
	},
	logIn:function(req, creds, callback){
        var client = new pg.Client(connStr);
        client.connect();
        res=client.query('select username, user_id, email from users2 where username=$1 and password=$2 and active=1 limit 1',[creds.username, md5(creds.password)],function(err, result){
            if(result.rows.length>0){
        		var data = result.rows[0];
        		var date = new Date()
        		data.token = md5(''+data.user_id+date);
        		res2 = client.query('insert into tokens (token, user_id, logged_out) values($1, $2, 0)', [data.token, data.user_id], function(err, res){
        			if(err){
        				console.log(err)
        			}
        			else{
						callback(true, data)
        			}
					client.end()
        		})
            }
            else{
                //client.query('insert into neuspjesni_login (lastcheck, ip) values(now()::TIMESTAMP WITHOUT TIME ZONE,$1)',[a]);
                callback(false, false);
            	client.end()
            }
        });
    }

}
module.exports=db;