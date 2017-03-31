/*
 to setup your own docker postgres db, install docker
 then in cmd/terminal, type:
 docker run -it --name my-postgres -p 5432:5432 postgres

 This will run your postgres db locally.
 With "docker ps -a" you can see all of your containers.
 Your my-postgres container should already be running. you can later stop and start it with "docker stop my-postgres" and
 "docker start my-postgres"

 Next, open pgadmin, right-click on servers on the left side, click on properties (and define a name if you haven't already).
 There in the second ribbon, set hostname as "localhost" and click save. You should now be connected to your postgres db.

 Now, you can execute this script. Navigate to this folder, in my case:
 cd git-repo
 Then execute it:
 node cli.js -s test
 This will add the scripts in the /testscripts folder and execute them. The dbpedia_musicians_nationality is changed such
 that it currently only fetches Frank Zappa and writes it to the output file.
 If everything worked correctly, CONGRATULATIONS! :D This entry should now be added to the db. You can check the artists
 table in pgadmin Servers->PSQL->Databases->postgres->schemas->public->tables->artists->
 rightclick and select "View Data ->View all data". Easy, right!?
 (If the script was successful but you cannot see any entries, you might need to restart pgadmin)




 THE NEXT STEPS TO IMPROVE THE SCRIPT:


 One would need to add a process.send to every script once its output file is written (see /testscripts/dbpedia_musicians_nationality.js)


 the "fs.readFile" in the populateDB function currently just gets the json file "testscripts/dbpedia_test.json". This would need to be solved
 dynamically. Either find all .json files in subfolders OR save all json outputfiles in one folder and then access them (second solution is
 probably better)



 */
const commander = require('commander');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');
//const path      = require('path');
/*const parser    = require(path.resolve(__dirname,'parser'));
 const dataGridRenderer    = require(path.resolve(__dirname,'dataGridRenderer'));*/

commander
    .option('-s, --script [script]', 'Define the scripts that should be executed', /^(dbpedia|worldcat|musicbrainz|allmusic|test)$/i)
    .option('-p, --postgres [postgres] ', 'Set the connection string to connect to the postgres db.')
    .parse(process.argv);

const script = commander.script || process.env.s;

const postgresCS = commander.postgres || process.env.p;

var scriptsArray = [];
if (script == "dbpedia") {
    console.log("Adding dbpedia scripts");
    scriptsArray.push("./dbpedia/dbpedia_Classical_musicians_by_century.js",
        "./dbpedia/dbpedia_Classical_musicians_by_instrument.js",
        "./dbpedia/dbpedia_Classical_musicians_by_instrument_and_nationality.js",
        './dbpedia/dbpedia_Classical_musicians_by_nationality.js',
        "./dbpedia/dbPedia_Composers.js"
    );
}
if (script == "worldcat") {
    console.log("Adding worldcat scripts");
    scriptsArray.push("./worldcat/worldcat.js"
    );
}
if (script == "musicbrainz") {
    console.log("Adding musicbrainz scripts");
    scriptsArray.push("./musicbrainz/scrapeArtists/server.js",
        "./musicbrainz/scrapeRecordings/server.js",
        "./musicbrainz/scrapeReleases/server.js",
        "./musicbrainz/scrapeWorks/server.js",
        "./musicbrainz/scrapeIDArtists/server.js",
        "./musicbrainz/RecordingsArtistsID/app.js",
        "./musicbrainz/DataForSequelizeAPI/app2.js",
        "./musicbrainz/PutJSONTogether/app.js"
    );
}
if (script == "allmusic") {
    console.log("Adding almusic scripts");
    scriptsArray.push("./allmusic/allMusicScript.js"
    );
}
if (script == "test") {
    console.log("Adding test scripts");
    scriptsArray.push("./testscripts/test.js",
        "./testscripts/test2.js",
        "./testscripts/test3.js",
        "./testscripts/dbpedia_musicians_nationality.js"
    );
}
var arrayLength = scriptsArray.length;
var cpCounter = 0;
for (var i = 0; i < arrayLength; i++) {
    var scriptToExecute = scriptsArray[i];
    //this will create a child process for every script
    const n = cp.fork(scriptToExecute);

    //once the script is done, it should send a message back to the main process
    n.on('message', function (m) {
        cpCounter++;
        console.log('child process finished:', m);
        //once all scripts are executed, continue with populating the db
        if (cpCounter == arrayLength) {
            populateDB();
        }
    })
    ;

}
;

function populateDB() {
    console.log("Starting to populate db");
    require(path.join(__dirname, "api", "database.js")).connect(postgresCS, function (context) {
        const api = require("./loadModules.js")(context, function () {
            context.sequelize.sync({force: true}).then(function () {

                // bulk create all artists
                const artists = context.component('models').module('artists');
                const artistspath = path.join(__dirname, "scrapedoutput", "artists")
                fs.readdir(artistspath, (err, files) => {
                    files.forEach(file => {
                        //for each file, read  it and do bulk create
                        fs.readFile(path.join(artistspath, file), function (err, data) {
                            artists.bulkCreate(JSON.parse(data))
                                .then(function () {
                                    console.log("Created artist entries for " + file);
                                }).catch(function (error) {
                                console.log("error: " + error);
                            })
                        })
                    });
                });

                // bulk create all works
                const works = context.component('models').module('works');
                const workspath = path.join(__dirname, "scrapedoutput", "works")
                fs.readdir(workspath, (err, files) => {
                    files.forEach(file => {
                        //for each file, read  it and do bulk create
                        fs.readFile(path.join(workspath, file), function (err, data) {
                            works.bulkCreate(JSON.parse(data))
                                .then(function () {
                                    console.log("Created work entries for " + file);
                                }).catch(function (error) {
                                console.log("error: " + error);
                            })
                        })
                    });
                });

                // bulk create all releases
                const releases = context.component('models').module('releases');
                const releasespath = path.join(__dirname, "scrapedoutput", "releases")
                fs.readdir(releasespath, (err, files) => {
                    files.forEach(file => {
                        //for each file, read  it and do bulk create
                        fs.readFile(path.join(releasespath, file), function (err, data) {
                            releases.bulkCreate(JSON.parse(data))
                                .then(function () {
                                    console.log("Created release entries for " + file);
                                }).catch(function (error) {
                                console.log("error: " + error);
                            })
                        })
                    });
                });


            }).catch(function (error) {
                console.error("There was an error while syncronizing the tables between the application and the database.");
                console.error(error);
                process.exit(2);
            });
        });


    });


}
