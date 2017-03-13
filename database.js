const req = require('request');
const pg = require('pg');
const express = require('express');
const router = express.Router();
const path = require('path');
const body_parser = require('body-parser');
const hostname = '127.0.0.1';
const port = 3000;

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(body_parser.json());
app.use(body_parser.urlencoded({
    extended: true
}));

var cn = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '1234',
};


app.post("/entities", function(req, res) {
    var user = req.body;
    var name = user.name;
    var pseudonym = [];
    pseudonym = user.pseudonym;
    var works = [];
    works = user.work;
    var releases = [];
    release = user.release;
    var srcLink = [];
    scrcLink = user.source_link;

    pg.connect(cn, function(err, client, done) {
        if (err) {
            console.log(err);
            // failure status code
        };
				console.log("received post request for ");
    });
    return res;
});


//URI:/entities - returns all the entities in the table
app.get("/entities", function(req, res) {
    const result = [];
    console.log("Received get request", name);

    pg.connect(cn, function(err, client, done) {
        if (err) throw err;

        var query = client.query('SELECT * FROM entities');
        query.on('row', function(row, result) {
            result.addRow(row);
        });
        query.on('end', function(result) {
            if (result.length == 0) {
                res.json({
                    "entities": []
                });
            } else {
                var jsonresult = {
                    "entities": result.rows
                };
                res.json(jsonresult);
            }
            done();
        });
    });
    return res;
});

//URI :/entities/entity:id
app.get("/entities/entity:id", function(req, res) {
    var user = req.params.id;
    const result = [];
    console.log("Received get request", name);

    pg.connect(cn, function(err, client, done) {
        if (err) throw err;

        var query = client.query('SELECT * FROM entities WHERE enitity_id=($1)', [user]);
        query.on('row', function(row, result) {
            result.addRow(row);
        });
        query.on('end', function(result) {
            if (result.length == 0) {
                res.json({
                    "entities": []
                });
            } else {
                var jsonresult = {
                    "entities": result.rows
                };
                res.json(jsonresult);
            }
            done();
        });

    });
    console.log("returning to client");
    return res;
});

//Method :PUT ,URI :/entities/entity:id
app.put("/entities/entity:id", function(req, res) {
	  var user = req.params.id;
    pg.connect(cn, function(err, client, done) {
        if (err) throw err;
				console.log("received put request for "+user);
    });
    done();
});

//Method : DELETE URI :/entities/entity:id
app.delete("/entities/entity:id", function(req, res) {
    var user = req.params.id;
    pg.connect(cn, function(err, client, done) {
        if (err) throw err;
        var query = client.query('DELETE FROM entities WHERE enitity_id=($1)', [user]);

    });
    done();
});
app.listen(port);
console.log('Listening at http://localhost:' + port)
