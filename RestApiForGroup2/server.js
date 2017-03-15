const req = require('request');
const pg = require('pg');
const express = require('express');
const router = express.Router();
const path = require('path');
const body_parser = require('body-parser');
const HttpStatus  = require('http-status-codes');
const hostname = '127.0.0.1';
const port = 3000;
var config = require(__dirname +'/cfg/config.template.js');

var app = express();
app.use(express.static(__dirname +'/public'));
app.use(body_parser.json());
app.use(body_parser.urlencoded({
    extended: true
}));

//construct the connection string in the form :
//"postgres://username:password@host:port/database"
function constructConnStr(config){
    var connString = "postgres://"+config.username+":"+config.password+
                     "@"+config.hostname+":"+config.port+"/"+config.database;
    console.log("connection string ",connString);
    return connString;
}

//connect to database
const psqlclient = new pg.Client(constructConnStr(config));
psqlclient.connect(function(err, psqlclient) {
    if (err) {
        console.log(err);
    } else {
        console.log("Server is connected to database")
    }
});
app.post("/entities", function(req, res) {
    var entity = req.body;
    var pseudonames = [];
    for (item of entity.pseudonym) {
        pseudonames.push(item);
    }
    var works = [];
    for (item of entity.work) {
        works.push(item);
    }
    var releases = [];
    for (item of entity.release) {
        releases.push(item);
    }
    var srcLink = [];
    for (item of entity.srcLink) {
        srcLink.push(item);
    }
    psqlclient.query('INSERT INTO "entities"' +
        ' (name,pseudonym,work,release,source_link)' +
        ' VALUES' +
        ' ($1,$2,$3,$4,$5)', [entity.name, pseudonames, works, releases, srcLink],
        function(err, response) {
            var jsonresult = ({
                "entities": []
            });
            if (err) {
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .send(' Query Incorrect');
            } else {
                return res.status(HttpStatus.CREATED).send('ok');
            }

        });
});

//URI:/entities - returns all the entities in the table
app.get("/entities", function(req, res) {
    const result = [];

    var query = psqlclient.query('SELECT * FROM entities');
    query.on('row', function(row, result) {
        result.addRow(row);
    });
    query.on('end', function(result) {
        if (result.length == 0) {
            var jsonresult = ({
                "entities": []
            });
            return res.status(HttpStatus.OK).json(jsonresult);
        } else {
            var jsonresult = {
                "entities": result.rows
            };
            return res.status(HttpStatus.OK).json(jsonresult);
        }
    });
});

//URI :/entities/entity:id
app.get("/entities/:id", function(req, res) {

    var id = req.params.id;
    const result = [];
    //console.log("Received get request", name);
    var query = psqlclient.query('SELECT * FROM entities WHERE entity_id=($1)', [id]);
    query.on('row', function(row, result) {
        result.addRow(row);
    });
    query.on('end', function(result) {
        if (result.length == 0) {
            return res.json({
                "entities": []
            });
        } else {
            var jsonresult = {
                "entities": result.rows
            };
            return res.status(HttpStatus.OK).json(jsonresult);
        }
    });
});

//Method :PUT ,URI :/entities/entity:id
app.put("/entities/:id", function(req, res) {
    var entityID = req.params.id;
    var entity = req.body;
    var pseudonames = [];
    for (item of entity.pseudonym) {
        pseudonames.push(item);
    }
    var works = [];
    for (item of entity.work) {
        works.push(item);
    }
    var releases = [];
    for (item of entity.release) {
        releases.push(item);
    }
    var srcLink = [];
    for (item of entity.srcLink) {
        srcLink.push(item);
    }

    psqlclient.query('UPDATE "entities" SET name=($1), pseudonym=($2) ' +
        ',work =($3),release = ($4) ,source_link = ($5) ' +
        ' WHERE entity_id = ($6)', [entity.name, pseudonames, works, releases, srcLink, entityID],
        function(err, response) {
            if (err) {
                console.log(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .send('Query Incorrect');
            } else {
                return res.status(HttpStatus.OK)
                    .send('Entity Updated');
            }
        });

});

//Method : DELETE URI :/entities/entity:id
app.delete("/entities/:id", function(req, res) {
    var entityId = req.params.id;
    var query = psqlclient.query('DELETE FROM entities WHERE entity_id=($1)', [entityId]);
    return res.status(HttpStatus.OK)
        .send('Entity deleted');


});
app.listen(port);
console.log('Listening at http://localhost:' + port);
