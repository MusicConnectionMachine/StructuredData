////// THIS SCRIPT LOADS THE INPUT JSON FILE INTO ENTITIES TABLE.THIS TABLE IS EXPOSED TO GROUP 2 THORUGH REST API'S //////////////////////////
var fs = require("fs");
var pg = require("pg");
var content = fs.readFileSync("dbpedia_composer.json");
var config = require(__dirname + '/cfg/config.template.js');
var jsonContent = JSON.parse(content);
var dbConnParams = config.database;

function constructConnStr(config) {
    var connString = "postgres://" + config.username + ":" + config.password +
        "@" + config.hostname + ":" + config.port + "/" + config.database;
    console.log("connection string ", connString);
    return connString;
}
i = 0;
pg.connect(constructConnStr(config), function(err, client, done) {
    if (err) {
        console.log(err);
    }
    while (i < jsonContent.length) {
        var work = [],
            release = [],
            pseudonym = [];
        client.query('INSERT INTO "entities"' +
            ' (name,pseudonym,work,release,source_link)' +
            ' VALUES' +
            ' ($1,$2,$3,$4,$5)', [jsonContent[i].name, jsonContent[i].pseudonym, jsonContent[i].work, jsonContent[i].release, jsonContent[i].source_link],
            function(err, res) {
                if (err) {
                    console.log(err);
                }
            }
        );
        i = i + 1;
        if (i >= jsonContent.length) {
            done();
        }
    }
});
