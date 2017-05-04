const commander = require('commander');
const path = require('path');
const fs = require('fs');
const cluster = require('cluster');
var scriptsArray = [];
var scriptsInput = [];
let instrumentsArray = [];

const availableScripts = ["dbpedia", "worldcat", "musicbrainz", "allmusic", "imslp"]
if (cluster.isMaster) {

    commander
        .option('-d, --database <database> ', 'Set the connection string to connect to the database.')
        .option('-t, --threads <threads> ', 'Set the amount of worker threads that should be spawned.')
        .arguments('[scripts...] ', /^(dbpedia|worldcat|musicbrainz|allmusic|imslp|test)$/i)
        .action(function (scripts) {
            scripts.forEach(function (script) {
                if (script == "all") {
                    scriptsInput = availableScripts
                }
                else if (availableScripts.includes(script) || script == "test") {
                    scriptsInput.push(script);
                }
                else {
                    console.log("invalid scriptsArray argument: " + script)
                }
            })
        })
        .parse(process.argv);

    if (scriptsInput.length === 0) {
        scriptsInput = process.env.s;
    }

    if (!scriptsInput) {
        console.log("No scripts specified. Aborting...")
        process.exit();
    }


    if (scriptsInput.includes("dbpedia")) {
        console.log("Adding dbpedia scripts");
        scriptsArray.push("./dbpedia/dbpedia_Classical_musicians_by_century.js",
            "./dbpedia/dbpedia_Classical_musicians_by_instrument.js",
            "./dbpedia/dbpedia_Classical_musicians_by_instrument_and_nationality.js",
            './dbpedia/dbpedia_Classical_musicians_by_nationality.js',
            "./dbpedia/dbPedia_Composers.js"
        );

    }
    if (scriptsInput.includes("worldcat")) {
        console.log("Adding worldcat scripts");
        scriptsArray.push("./WorldCat/worldcat.js"
        );
    }
    if (scriptsInput.includes("musicbrainz")) {
        console.log("Adding musicbrainz scripts");
        scriptsArray.push("./musicbrainz/server.js"
        );
    }
    if (scriptsInput.includes("allmusic")) {
        console.log("Adding almusic scripts");
        scriptsArray.push("./allmusic/allMusicScript.js"
        );
    }
    if (scriptsInput.includes("imslp")) {
        console.log("Adding imslp script");
        scriptsArray.push(
            "./IMSLP/imslp.js"
        );
    }
    if (scriptsInput.includes("test")) {
        console.log("Adding test scripts");
        scriptsArray.push(
            "./testscripts/empty.js"
        );
    }

    var cpus = require('os').cpus().length;
    var numWorkers;
    let postgresConnectionString = commander.database || process.env.d;

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
            worker.send([scriptToExecute, postgresConnectionString]);
        }

    }

    cluster.on('exit', function (deadworker, code, signal) {
        console.log('Worker ' + deadworker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        var scriptToExecute = scriptsArray.pop();
        if (scriptToExecute) {
            // if a worker dies and there are still remaining scripts, spawn a new worker and let him execute it
            var worker = cluster.fork();
            worker.send([scriptToExecute, postgresConnectionString]);
        }
    });


    cluster.on('message', function (m) {
        scrapingcounter--;
        if (scrapingcounter === 0) {
            //once all scraping scripts finished, populate the db
            console.log("all done");
            populateDB(postgresConnectionString);
        }
    });
}
else {
    process.on("message", function (options) {
        let [scriptToExecute, postgresConnectionString] = options;
        console.log("Worker is executing " + scriptToExecute + " with connection to " + postgresConnectionString);
        var script = require(scriptToExecute);
        script(() => {
            console.log(scriptToExecute + " finished successfully");
            process.send("done");
            process.exit();
        }, postgresConnectionString);
    });
}

function populateDB(postgresConnectionString) {
    console.log("Starting to populate db");

    require(path.join(__dirname, "api", "database.js")).connect(postgresConnectionString, function (context) {

            /* Order:
             1. musicbrainz artists
             2. musicbrainz works/releases (as seperate input files)
             3. dbpedia artists
             4. dbpedia works/releases (as array in the artists input)
             */

            //prepopulate instrumentsArray
            const instruments = context.models.instruments;
            instruments.findAll().then((queriedInstruments)=>{
                queriedInstruments.forEach((instrument)=>{
                    if(!instrumentsArray.includes(instrument)){
                        instrumentsArray.push(instrument.name)
                    }
                })
            });

            const musicbrainzArtistspath = path.join(__dirname, "scrapedoutput", "musicbrainz", "ArtistsMusicBrainz.json");
            fs.readFile(path.join(musicbrainzArtistspath), function (err, data) {
                var artistsData = JSON.parse(data);
                populateArtists(context, artistsData, () => {
                    let counter = 0;
                    musicbrainzPopulateWorks(context, artistsData, () => {
                        counter++;
                        if (counter === 2) {
                            dbpediaPopulateArtists(context);
                        }
                    });
                    musicbrainzPopulateReleases(context, artistsData, () => {
                        counter++;
                        if (counter == 2) {
                            dbpediaPopulateArtists(context);
                        }
                    });


                });
            });
    });
}

function musicbrainzPopulateWorks(context, artistsData, callback) {
    const musicbrainzWorkspath = path.join(__dirname, "scrapedoutput", "musicbrainz", "WorksMusicBrainz.json");

    fs.readFile(musicbrainzWorkspath, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        var worksData = JSON.parse(data);
        populateWorks(context, worksData, artistsData, callback);
    });
}

function musicbrainzPopulateReleases(context, artistsData, callback) {
    const musicbrainzReleasespath = path.join(__dirname, "scrapedoutput", "musicbrainz", "ReleasesMusicBrainz.json");

    fs.readFile(musicbrainzReleasespath, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        var ReleaseData = JSON.parse(data);
        populateReleases(context, ReleaseData, artistsData, callback);
    });
}

function populateWorks(context, worksData, artistsData, callback) {
    const works = context.models.works;
    const entities = context.models.entities;
    const artists = context.models.artists;
    worksData.forEach((work) => {
        entities.create().then(entity => {
            works.create({
                title: work.title,
                entityId: entity.id
            }).then(createdWork => {
                //search artist from artistsData where id == worksData id
                var artistFound = artistsData.filter(function (artist) {
                    return artist.musicbrainzArtistId === work.composer;
                });
                if (artistFound) {
                    artists.findOne({where: {name: artistFound[0].name}}).then(function (queriedArtist) {
                        createdWork.addArtists(queriedArtist);
                    });
                }
            });
        }).catch(function (error) {
            console.log("Error while creating work " + work.title + ": " + error);
        });
    });
    callback();
}

function populateReleases(context, releasesData, artistsData, callback) {
    const releases = context.models.releases;
    const entities = context.models.entities;
    const artists = context.models.artists;
    releasesData.forEach(release => {
        entities.create().then(entity => {
            releases.create({
                title: release.title,
                format: release.format,
                date: release.date,
                country: release.country,
                label: release.label,
                entityId: entity.id
            }).then((createdRelease) => {
                //search artist from artistsData where id == releasesData id
                var artistFound = artistsData.filter(function (artist) {
                    return artist.musicbrainzArtistId === release.musicbrainzArtistId;
                });
                artists.findOne({where: {name: artistFound[0].name}}).then(function (queriedArtist) {

                    createdRelease.addArtists(queriedArtist);

                });


            })
        }).catch(function (error) {
            console.log("Error while creating release " + release.title + ": " + error);
        });
    });
    callback();
}

function populateArtists(context, artistsOutput, callback) {

    const artists = context.models.artists;
    const entities = context.models.entities;
    artistsOutput.forEach(artist => {
        entities.create().then(entity => {
            artists.create({
                name: artist.name,
                artist_type: artist.artist_type,
                nationality: artist.nationality,
                dateOfBirth: artist.dateOfBirth,
                dateOfDeath: artist.dateOfDeath,
                placeOfBirth: artist.placeOfBirth,
                placeOfDeath: artist.placeOfDeath,
                instrument: artist.instrument,
                pseudonym: artist.pseudonym,
                /*work: artist.work,
                 release: artist.release,*/
                tags: artist.tags,
                source_link: artist.source_link,
                wiki_link: artist.wiki_link,
                wiki_pageid: artist.wiki_pageid,
                entityId: entity.id
            }).then(function (createdArtist) {
                if (artist.work) {
                    artist.work.forEach(function (work) {
                        connectArtistToWorks(context, createdArtist, work);
                    });
                }
                if (artist.release) {
                    artist.release.forEach(function (release) {
                        connectArtistToReleases(context, createdArtist, release);
                    });
                }
                if (artist.instrument) {
                    artist.instrument.forEach(function (instrument) {
                        if(instrument.includes(",")){
                           let tempInstruments = instrument.split(",");
                            tempInstruments.forEach((tempInstrument)=>{
                                connectArtistToInstruments(context, createdArtist, tempInstrument);
                            })
                        }
                        else{
                            connectArtistToInstruments(context, createdArtist, instrument);
                        }

                    });
                }
            });

        }).catch(function (error) {
            console.log("Error while creating artist " + artist.name + ": " + error);
        });
    });
    callback();
}


function dbpediaPopulateArtists(context) {
    const dbpediaArtistsPath = path.join(__dirname, "scrapedoutput", "dbpedia");
    fs.readdir(dbpediaArtistsPath, (err, files) => {
        if (err) {
            console.log(err);
            return;
        }
        files.forEach(file => {
            //for each file, read  it and do bulk create
            fs.readFile(path.join(dbpediaArtistsPath, file), function (err, data) {
                var artistsData = JSON.parse(data);
                populateArtists(context, artistsData, () => {
                });
            })
        });
    });
}

function connectArtistToWorks(context, createdArtist, work) {
    if(work.startsWith("dbr:")){
        work = work.replace("dbr:","");

    }
    const works = context.models.works;
    const entities = context.models.entities;
    works.findOne({where: {title: work}}).then(function (queriedWork) {
        // if work does not exist yet, create it
        if (!queriedWork) {
            entities.create().then(entity => {
                works.create({
                    title: work,
                    entityId: entity.id
                }).then(createdWork => {
                    createdArtist.addWorks(createdWork);
                })
            });
        }
        else {
            createdArtist.addWorks(queriedWork);
        }
    });

}

function connectArtistToReleases(context, createdArtist, release) {
    const releases = context.models.releases;
    const entities = context.models.entities;
    releases.findOne({where: {title: release}}).then(function (queriedRelease) {
        // if release does not exist yet, create it
        if (!queriedRelease) {
            entities.create().then(entity => {
                releases.create({
                    title: release,
                    entityId: entity.id
                }).then(createdRelease => {
                    createdArtist.addReleases(createdRelease);
                })

            });
        }
        else {
            createdArtist.addReleases(queriedRelease);
        }
    });
}


function connectArtistToInstruments(context, createdArtist, instrument) {
    if(instrument.trim()==="*"){
        return
    }
    const instruments = context.models.instruments;
    const entities = context.models.entities;
    if(instrumentsArray.includes(instrument)){
        if (createdArtist.artist_type == "composer") {
            createdArtist.addComposer(instrument);

        }
        if (createdArtist.artist_type == "musician") {
            createdArtist.addPlayer(instrument);
        }
    }
    else{
        instrumentsArray.push(instrument);
        entities.create().then(entity => {
            instruments.create({
                name: instrument,
                entityId: entity.id
            }).then(createdInstrument => {
                if (createdArtist.artist_type == "composer") {
                    createdArtist.addComposer(createdInstrument);
                }
                if (createdArtist.artist_type == "musician") {
                    createdArtist.addPlayer(createdInstrument);
                }
            })
        });
    }
}
