const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');


let populateFromImslp = (callback, postgresConnectionString) => {
    fs.readFile(path.join(__dirname, "composition-metadata.tsv"), 'utf8', (err,data) => {
        if (err) {
            return console.error(err);
        }
        data = data.split('\n');


        let entityIds = [];
        let artists = (() => {
            let list = [];

            return {
                add(artist) {
                    let match = list.find((element)=>element.name === artist.name);
                    if(match === undefined){
                        list.push(artist);

                        entityIds.push({
                            id: artist.entityId
                        });

                        return artist.artistId;
                    } else {
                        return match.artistId;
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

                        entityIds.push({
                            id: instrument.entityId
                        });

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

                    "entityId": uuid()

                };

                artistId = artists.add(artist);

                if(currentElement['Instrumentation'] !== undefined){
                    currentElement['Instrumentation'].split(', ').forEach((instrument) => {
                        instruments.add({
                            name: instrument,

                            artistId: artistId,
                            entityId: uuid()
                        })
                    });
                }
            }

            let work = {
                "title": currentElement['Work Title'],

                "artistId": artistId,
                "entityId": uuid()
            };

            if(currentElement['Dedication']){
                work.dedication = currentElement['Dedication']
            }
            if(currentElement['Style']){
                work.style = currentElement['Style']
            }
            if(currentElement['Tags']){
                work.tags = currentElement['Tags']
            }

            works.push(work);
            entityIds.push({
                id: work.entityId
            });

        });

        console.log("Collected " + works.length + " works, " + artists.getArtists().length + " artists and " + instruments.getInstruments().length + " instruments.");

        require(path.join(__dirname, "..", "api", "database.js"))
            .connect(postgresConnectionString, (context) => {
                console.log("Connected");

                const artistsModel = context.models.artists;
                const instrumentsModel = context.models.instruments;
                const worksModel = context.models.works;
                const entityModel = context.models.entities;

                entityModel.bulkCreate(entityIds)
                    .then(() => {
                        console.log("created entities");
                        artistsModel.bulkCreate(artists.getArtists())
                            .then(() => {
                                console.log("created artists");
                                instrumentsModel.bulkCreate(instruments.getInstruments())
                                    .then(() => {
                                        console.log("created instruments");
                                        worksModel.bulkCreate(works, {returning: true})
                                            .then(() => {
                                                console.log("created works");

                                                console.log("Inserted artist, work and instruments.");

                                                // TODO - mapping instruments to artists, works to artists
                                                return callback();
                                            });
                                    })
                                .catch((err) => {
                                    console.log(err);
                                });
                            });
                    });
            });
    });
};

module.exports = populateFromImslp;
