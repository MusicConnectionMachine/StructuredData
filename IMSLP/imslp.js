const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const Promises = require('q');

module.exports = (callback, postgresConnectionString) => {
    fs.readFile(path.join(__dirname, "composition-metadata.tsv"), 'utf8', (err,data) => {
        if (err) {
            return console.error(err);
        }
        data = data.split('\n');

        let artists = (() => {
            let list = [];

            return {
                add(artist) {
                    let match = list.find((element)=>element.name === artist.name);
                    if(match === undefined){
                        list.push(artist);
                        return artist.id;
                    } else {
                        return match.id;
                    }
                },
                getArtists(){
                    return list;
                }
            }
        })();

        let works = [];

        let instruments = (() => {
            let list = [];

            return {
                add(instrument) {
                    let match = list.find((element)=>element.artistId === instrument.artistId);
                    if(match === undefined) {
                        list.push(instrument);
                    }
                },
                getInstruments(){
                    return list;
                }
            }
        })();


        /** What I have in the data
         'Composer',                                USING
         'Composer Time Period',                    USING
         'Dedication',                              USING
         'First Publication',                       NO
         'Instrumentation',                         USING
         'Piece Style',                             USING
         'Work Title',                              USING
         'tags',                                    USING
         'Average Duration',                        NO
         'Year/Date of Composition',                NO
         'Alternative Title',                       NO
         'Key',                                     NO
         'Language',                                NO
         'Librettist',                              NO
         'Movements/Sections',                      NO
         'First Performance',                       NO
         'Related Works',                           NO
         'Opus/Catalogue Number',                   NO
         'Copyright Information',                   NO
         'Extra Information',                       NO
         'External Links',                          NO
         'Text Incipit',                            NO
         'Extra Locations',                         NO
         'Mss Sources',                             NO
         'Additional Copyright Info'                NO
         */
        data.forEach((line) => {
            line = line.split('\t');
            let currentElement = JSON.parse(line[1]);
            let artistId = undefined;

            if(currentElement['Composer']){
                let artist = {
                    "name": (()=>{
                        let commaSeparatedName = currentElement['Composer'];
                        commaSeparatedName = commaSeparatedName.split(", ");
                        return commaSeparatedName[1] + " " + commaSeparatedName[0];
                    })(),
                    "artist_type":"composer",
                    "tag": [currentElement['Composer Time Period']],
                    "id": uuid()
                };

                artistId = artists.add(artist);

                if(typeof currentElement['Instrumentation'] === Array){
                    currentElement['Instrumentation'].forEach((instrument) => {
                        instruments.add({
                            name: instrument,
                            artistId: artistId
                        })
                    });
                }
            }

            let work = {
                "title": [currentElement['Work Title']],
                "dedication": [currentElement['Dedication']],
                "style": [currentElement['Piece Style']],
                "tags": [currentElement['Tags']],
                "artistId": artistId
            };

            works.push(work);
        });

        let zipArtistWorkInstrument = artists.getArtists().map((artist)=>{
            artist.works = works.filter((work)=> work.artistId === artist.id);
            artist.instruments = instruments.getInstruments().filter((instrument)=> instrument.artistId === artist.id);

            return artist;
        });

        let unassignedWorks = works.filter((work) => work.artistId === undefined);

        require(path.join(__dirname, "..", "api", "database.js"))
            .connect(postgresConnectionString, (context) => {
                let promises = [];

                const artistsModel = context.models.artists;
                const instrumentsModel = context.models.instruments;
                const worksModel = context.models.works;

                zipArtistWorkInstrument.forEach((artist)=>{
                    let artistPromise = Promises.defer();
                    promises.push(artistPromise.promise);

                    artistsModel.create(artist).then((databaseArtist) => {
                        artist.works.forEach((work) => {
                            let workPromise = Promises.defer();
                            promises.push(workPromise.promise);

                            worksModel.create(work).then((databaseWork) => {
                                databaseArtist.addWorks(databaseWork);
                                workPromise.resolve();
                            });
                        });

                        artist.instruments.forEach((instrument) => {
                            let instrumentPromise = Promises.defer();
                            promises.push(instrumentPromise.promise);

                            instrumentsModel.findOne({
                                where: {
                                    name: instrument.name
                                }
                            }).then(function (matchInstrument) {
                                // if instrument does not exist yet, create it
                                if (matchInstrument !== undefined && matchInstrument !== null) {
                                    instrumentsModel.create(instrument).then(createdInstrument => {
                                        databaseArtist.addComposer(createdInstrument);
                                        instrumentPromise.resolve();
                                    });
                                }
                                else {
                                    databaseArtist.addComposer(matchInstrument);
                                    instrumentPromise.resolve();
                                }
                            });
                        });

                        artistPromise.resolve();
                    });
                });

                unassignedWorks.forEach((work) => {
                    let unassignedWorkPromise = Promises.defer();
                    promises.push(unassignedWorkPromise.promise);
                    worksModel.create(work).then(() => {
                        unassignedWorkPromise.resolve();
                    });
                });

                Promises.all(promises).then(() => {
                    callback();
                });
            });
    });
};