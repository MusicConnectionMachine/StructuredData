const commander = require('commander');
const path = require('path');
const fs = require('fs');
const cluster = require('cluster');
var scriptsArray = [];
var script, postgresCS;
if (cluster.isMaster) {

    commander
        .option('-s, --script [script]', 'Define the scripts that should be executed', /^(dbpedia|worldcat|musicbrainz|allmusic|test)$/i)
        .option('-d, --database [database] ', 'Set the connection string to connect to the database.')
        .option('-t, --threads [threads] ', 'Set the amount of worker threads that should be spawned.')
        .parse(process.argv);

    script = commander.script || process.env.s;

    postgresCS = commander.database || process.env.d;


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
        scriptsArray.push(
            "./testscripts/dbpedia_one_musician.js"
        );
    }


    var cpus = require('os').cpus().length;
    var numWorkers;

    if (commander.threads) {
        if (commander.threads > cpus) {
            console.log("The number of your specified threads exceeds available cpus, reducing it to " + cpus);
            numWorkers = cpus;
        }
        else {
            console.log("Setting number of threads to " + commander.threads);
            numWorkers = commander.threads;
        }
    }
    else {
        console.log("Setting number of threads to maximum of " + cpus);
        numWorkers = cpus;
    }

    var scrapingcounter = scriptsArray.length;
    console.log('Master cluster setting up ' + numWorkers + ' workers...');
    for (var i = 0; i < numWorkers; i++) {
        var worker = cluster.fork();
        var scriptToExecute = scriptsArray.pop();
        if (scriptToExecute) {
            //let worker execute the scrape script
            worker.send(scriptToExecute);
        }

    }

    cluster.on('exit', function (deadworker, code, signal) {
        console.log('Worker ' + deadworker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        var scriptToExecute = scriptsArray.pop();
        if (scriptToExecute) {
            // if a worker dies and there are still remaining scripts, spawn a new worker and let him execute it
            var worker = cluster.fork();
            worker.send(scriptToExecute);
        }
    });


    cluster.on('message', function (m) {
        scrapingcounter--;
        if (scrapingcounter === 0) {
            //once all scraping scripts finished, populate the db
            console.log("all done");
            populateDB();
        }
    });
}
else {
    process.on("message", function (scriptToExecute) {
        console.log("Worker is executing " + scriptToExecute);
        var script = require(scriptToExecute);
        script(function () {
            console.log(scriptToExecute + " finished successfully");
            process.send("done");
            process.exit();
        })

    });

}

function populateDB() {
    console.log("Starting to populate db");

    require(path.join(__dirname, "api", "database.js")).connect(postgresCS, function (context) {

        context.sequelize.sync({force: true}).then(function () {

            // bulk create all artists
            const artists = context.models.artists;
            const artistspath = path.join(__dirname, "scrapedoutput", "artists")
            fs.readdir(artistspath, (err, files) => {
                if (err) {
                    console.log(err);
                    return;
                }
                files.forEach(file => {
                    //for each file, read  it and do bulk create
                    fs.readFile(path.join(artistspath, file), function (err, data) {
                        var jsonData = JSON.parse(data);
                        populateArtists(context, jsonData);
                    })
                });
            });


            // bulk create all works
            const works = context.models.works;
            const workspath = path.join(__dirname, "scrapedoutput", "works")
            fs.readdir(workspath, (err, files) => {
                if (err) {
                    console.log(err);
                    return;
                }
                files.forEach(file => {
                    //for each file, read  it and do bulk create
                    fs.readFile(path.join(workspath, file), function (err, data) {
                        var jsonData = JSON.parse(data);
                        populateWorks(context, jsonData);
                    })
                });
            });


            // bulk create all releases
            const releases = context.models.releases;
            const releasespath = path.join(__dirname, "scrapedoutput", "releases")
            fs.readdir(releasespath, (err, files) => {
                if (err) {
                    console.log(err);
                    return;
                }
                files.forEach(file => {
                    //for each file, read  it and do bulk create
                    fs.readFile(path.join(releasespath, file), function (err, data) {
                        var jsonData = JSON.parse(data);
                        populateReleases(context, jsonData);
                    })
                });
            });


        }).catch(function (error) {
            console.error("There was an error while syncronizing the tables between the application and the database.");
            console.error(error);
            process.exit(2);
        });


    });


}
function populateArtists(context, jsonData) {
    const artists = context.models.artists;
    const entities = context.models.entities;
    jsonData.forEach(artist => {
        entities.create().then(function (entity) {
            artists.create({
                name: artist.name,
                nationality: artist.nationality,
                dateOfBirth: artist.dateOfBirth,
                dateOfDeath: artist.dateOfDeath,
                placeOfBirth: artist.placeOfBirth,
                placeOfDeath: artist.placeOfDeath,
                instrument: artist.instrument,
                psuedonym: artist.psuedonym,
                work: artist.work,
                release: artist.release,
                tags: artist.tag,
                source_link: artist.source_link,
                wiki_link: artist.wiki_link,
                wiki_pageid: artist.wiki_pageid,
                entityId: entity.id
            });
        }).catch(function (error) {
            console.log("Error while creating artist " + artist.name + ": " + error);
        });
    })
}

function populateWorks(context, jsonData) {
    const works = context.models.works;
    const entities = context.models.entities;
    jsonData.forEach(work => {
        entities.create().then(function (entity) {
            works.create({
                title: work.title,
                compositionyear: work.compositionyear,
                entityId: entity.id
            });
        }).catch(function (error) {
            console.log("Error while creating work " + work.title + ": " + error);
        });
    })
}

function populateReleases(context, jsonData) {
    const releases = context.models.releases;
    const entities = context.models.entities;
    jsonData.forEach(release => {
        entities.create().then(function (entity) {
            releases.create({
                title: release.title,
                format: release.format,
                date: release.date,
                country: release.country,
                label: release.label,
                entityId: entity.id
            });
        }).catch(function (error) {
            console.log("Error while creating release " + release.title + ": " + error);
        });
    })
}
