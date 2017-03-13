const req = require('request');

const pg = require('pg');
const pgp = require('pg-promise')();
const express = require('express');
const router = express.Router();
const path = require('path');
const body_parser = require('body-parser');
const hostname = '127.0.0.1';
const port = 3000;

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended: true}));
var cn = {
	host : 'localhost',
	port : 5432,
	database : 'postgres',
	user : 'postgres',
	password : '1234',
	//max:10,
	//idleTimeoutMillis:1000,
};

//var pool = new pg.Pool(cn);
//var client = new pg.Client(cn);
//client.connect();
app.get("/entities",function(req,res){
	
	var user = req.body;
	console.log("here",user);
        var name = user.name;
	console.log("here2",name);
	const result =[];
	console.log("Received get request",name);
	//pool.connect(function(err,client,done){
	pg.connect(cn,function(err,client,done){
		if(err) throw err;
	
		var query = client.query('SELECT * FROM entities WHERE name=($1)',[name]);
		//var query = client.query('SELECT * FROM entities');//works fine
	        query.on('row',function(row,result){
			//if (err) throw err;
			result.addRow(row);
		});;
		query.on('end',function(result){
			//if(err) throw err;
			 if(result.length == 0){
        	                res.json({"entities": []});
	                } else {
                        var jsonresult = {"entities": result.rows};
                        res.json(jsonresult);
                	}
			done();
			//client.end();
		});
	//	client.release();
	//	done();
    	}); 
	console.log("returning to client");
    	return res;
});

port = 3000;
app.listen(port);
console.log('Listening at http://localhost:'+port)
