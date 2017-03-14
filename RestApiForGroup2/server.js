const req = require('request');
const pg = require('pg');
const express = require('express');
const router = express.Router();
const path = require('path');
const body_parser = require('body-parser');
const  HttpStatus  =  require('http-status-codes');
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
    console.log(pseudonames);
    pg.connect(cn, function(err, client, done) {
        if (err) {
            console.log(err);
        };

        client.query('INSERT INTO "entities"' +
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
        console.log("returning from post");
        done();
    });

});

//URI:/entities - returns all the entities in the table
app.get("/entities", function(req, res) {
    const result = [];
    //console.log("Received get request", name);

    pg.connect(cn, function(err, client, done) {
        if (err) throw err;

        var query = client.query('SELECT * FROM entities');
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
            done();
        });
    });

});

//URI :/entities/entity:id
app.get("/entities/:id", function(req, res) {

    var id = req.params.id;
    const result = [];
    //console.log("Received get request", name);

    pg.connect(cn, function(err, client, done) {
        if (err) throw err;

        var query = client.query('SELECT * FROM entities WHERE entity_id=($1)', [id]);
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
            done();
        });

    });
    console.log("returning to client");
    //return res.send();
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
    pg.connect(cn, function(err, client, done) {
        if (err) {
            console.log(err);
        } else {
            client.query('UPDATE "entities" SET name=($1), pseudonym=($2) '
                 +',work =($3),release = ($4) ,source_link = ($5) '
                +' WHERE entity_id = ($6)'
                , [entity.name, pseudonames, works, releases, srcLink, entityID],
                function(err, response) {
                    if (err) {
                        console.log(err);
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .send(' Query Incorrect');
                    } else {
                        return res.status(HttpStatus.OK)
                            .send('Entity Updated');
                    }
                });
            done();
        }
    });
    console.log("returning to client");
});

//Method : DELETE URI :/entities/entity:id
app.delete("/entities/:id", function(req, res) {
    var entityId = req.params.id;
    pg.connect(cn, function(err, client, done) {
        if (err) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send('please try later');
        } else {
            var query = client.query('DELETE FROM entities WHERE entity_id=($1)'
                      , [entityId]);
            return res.status(HttpStatus.OK)
                .send('Entity deleted');
        }
        done();
    });

});
app.listen(port);
console.log('Listening at http://localhost:' + port);
