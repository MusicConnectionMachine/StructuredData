////// THIS SCRIPT LOADS THE INPUT JSON FILE INTO ENTITIES TABLE.THIS TABLE IS EXPOSED TO GROUP 2 THORUGH REST API'S //////////////////////////
var fs = require("fs");
var pg = require("pg");
var config = require(__dirname + '/cfg/config.template.js');
var content = fs.readFileSync("dbPedia_Composers.json");
var jsonContent = JSON.parse(content);
var dbConnParams = config.database;
var entity_type1 = "musician"; //composer
var entity_type2 = "release"; //work
console.log(dbConnParams);

function constructConnStr(config) {
    var connString = "postgres://" + config.username + ":" + config.password +
        "@" + config.hostname + ":" + config.port + "/" + config.database;
    console.log("connection string ", connString);
    return connString;
}
i = 0;
console.log(jsonContent.length);
pg.connect(constructConnStr(config), function(err, client, done) {
    if (err) {
        console.log(err);
    }
    while (i < jsonContent.length) {
        insert_into_entities(jsonContent[i].name, entity_type1, client);
        if (jsonContent[i].release != null) {
            for (var k = 0; k < jsonContent[i].release.length; k++) {
                if (jsonContent[i].release[k] != "") {
                    insert_into_entities(jsonContent[i].release[k], entity_type2, client);
                }
            }
        }
        i = i + 1;
        if (i >= jsonContent.length) {
            done();
        }
    }
});

function insert_into_entities(value1, value2, client) {
    value1 = value1.replace(/,/g, '');
    value1 = value1.replace(/_/g, ' ');
    client.query('INSERT INTO "entities"' +
        ' (entity_name,entity_type)' +
        ' VALUES' +
        ' ($1,$2)', [value1, value2],
        function(err, res) {
            if (err) {
                console.log(err);
            }
        }
    );
}
