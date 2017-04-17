var request = require("request");
var fs = require('fs');
var cheerio = require('cheerio');


module.exports = {
    getArtists: function (finalArray, returnToServerJS) {

        var elemNum = 0;
        var requestCounter = 0;
        var artistsAPI = [];
        var artists = [];

        var intervalId3 = setInterval(function () {


            var url = "http://musicbrainz.org/ws/2/artist/" + finalArray[elemNum] + "?&fmt=json";

            console.log('request artist ' + finalArray[elemNum]);

            request({
                url: url,
                headers: {
                    'User-Agent': 'ClassicalApp/1.4.0'
                },
                json: true
            }, function (error, response, body) {
                requestCounter++;
                if (error) {
                    console.log("getArtists request error: " + error);
                }
                if (body && body.error) {
                    console.log("getArtists body error: " + body.error);
                }
                if (body && !body.error) {
                    artists.push(body);
                }

                if (requestCounter == finalArray.length) {

                    for (i = 0; i < artists.length; i++) {

                        var aboutArtist = artists[i];
                        var name = aboutArtist.name;
                        var source_link = "https://musicbrainz.org/artist/" + aboutArtist.id;
                        var dateOfBirth;
                        var dateOfDeath;
                        if (aboutArtist.hasOwnProperty("life-span")) {
                            if (aboutArtist["life-span"].hasOwnProperty("begin") && aboutArtist["life-span"].begin != null) {
                                dateOfBirth = aboutArtist["life-span"].begin;
                            }
                            if (aboutArtist["life-span"].hasOwnProperty("end") && aboutArtist["life-span"].end != null) {
                                dateOfDeath = aboutArtist["life-span"].end;
                            }
                        }

                        //add day and month to year, otherwise Sequelize fails with "invalid input syntax for type date"
                        if (/^\d{4}$/.test(dateOfBirth)) {
                            dateOfBirth = dateOfBirth + "-01-01"
                        }
                        if (/^\d{4}$/.test(dateOfDeath)) {
                            dateOfDeath = dateOfDeath + "-01-01"
                        }
                        if (/^\d{4}-\d{2}$/.test(dateOfBirth)) {
                            dateOfBirth = dateOfBirth + "-01"
                        }
                        if (/^\d{4}-\d{2}$/.test(dateOfDeath)) {
                            dateOfDeath = dateOfDeath + "-01"
                        }


                        var nationality;
                        if (aboutArtist.hasOwnProperty("area") && aboutArtist.area != null) {
                            nationality = aboutArtist.area.name;
                        }
                        var placeOfBirth;
                        if (aboutArtist.hasOwnProperty("begin_area") && aboutArtist.begin_area != null) {
                            placeOfBirth = aboutArtist.begin_area.name;
                        }
                        var placeOfDeath;
                        if (aboutArtist.hasOwnProperty("end_area") && aboutArtist.end_area != null) {
                            placeOfDeath = aboutArtist.end_area.name;
                        }

                        var pseudonym = [];
                        if (aboutArtist.hasOwnProperty("aliases") && aboutArtist.aliases != null) {
                            aboutArtist.aliases.forEach(function (alias) {
                                pseudonym.push(alias.name);
                            });
                        }

                        var tags = [];
                        var artist_type = null;
                        if (aboutArtist.hasOwnProperty("tags") && aboutArtist.tags != null) {
                            aboutArtist.tags.forEach(function (tag) {
                                if (tag.name != "to clean up") {
                                    tags.push(tag.name);
                                    if (tag.name == "composer") {
                                        artist_type = "composer";
                                    }
                                }

                            });
                        }
                        var work, release, instrument = [];


                        artistsAPI.push({
                            name: name,
                            artist_type: artist_type,
                            nationality: nationality,
                            dateOfBirth: dateOfBirth,
                            dateOfDeath: dateOfDeath,
                            placeOfBirth: placeOfBirth,
                            placeOfDeath: placeOfDeath,
                            instrument: null,
                            pseudonym: pseudonym,
                            work: null,
                            release: null,
                            tags: tags,
                            source_link: source_link,
                            musicbrainzArtistId: aboutArtist.id
                        });

                    }
                    json2 = JSON.stringify(artistsAPI); //convert it back to json
                    fs.writeFile('./scrapedoutput/musicbrainz/ArtistsMusicBrainz.json', json2, 'utf8', function writeFileCallback(err, data) {
                        console.log("finished writing artists")
                        returnToServerJS();
                    }); // write it back

                }

            });
            elemNum = elemNum + 1;
            if (elemNum == finalArray.length) {
                clearInterval(intervalId3);
            }


        }, 1200)


    },

};





