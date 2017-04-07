var request = require("request");
var fs = require('fs');
var cheerio = require('cheerio');
var sleep = require('system-sleep')
var intervalId3 = null;

var newObj3 = {};
var artistsAPI = [];

module.exports = {
    getArtists: function (finalArray, returnToServerJS) {

        var elemNum = 0;

        var newObj = {
            table: []
        };

        intervalId3 = setInterval(function () {

            if (elemNum == finalArray.length) {

                clearInterval(intervalId3);

                obj = newObj;

                for (i = 0; i < obj.table.length; i++) {
                    if (obj.table[i].hasOwnProperty("aboutartist")) {
                        var artistObject = {
                            nationality: null,
                            dateOfBirth: null,
                            dateOfDeath: null,
                            placeOfBirth: null,
                            placeOfDeath: null,
                            instrument: null,
                            psuedonym: null,
                            work: null,
                            release: null,
                            tag: null
                        };
                        var aboutArtist = obj.table[i].aboutartist;
                        artistObject.name = aboutArtist.name;
                        artistObject.source_link = "https://musicbrainz.org/artist/" + obj.table[i].artistId;

                        if (aboutArtist.hasOwnProperty("life-span")) {
                            if (aboutArtist["life-span"].hasOwnProperty("begin") && aboutArtist["life-span"].begin != null) {
                                artistObject.dateOfBirth = aboutArtist["life-span"].begin;
                            }
                            if (aboutArtist["life-span"].hasOwnProperty("end") && aboutArtist["life-span"].end != null) {
                                artistObject.dateOfDeath = aboutArtist["life-span"].end;
                            }
                        }

                        if (aboutArtist.hasOwnProperty("area") && aboutArtist.area != null) {
                            artistObject.nationality = aboutArtist.area.name;
                        }

                        if (aboutArtist.hasOwnProperty("begin_area") && aboutArtist.begin_area != null) {
                            artistObject.placeOfBirth = aboutArtist.begin_area.name;
                        }

                        if (aboutArtist.hasOwnProperty("end_area") && aboutArtist.end_area != null) {
                            artistObject.placeOfDeath = aboutArtist.end_area.name;
                        }
                        console.log("adding " + artistObject.name);
                        artistsAPI.push(artistObject);
                    }
                }
                console.log("write to output file ");
                json2 = JSON.stringify(artistsAPI); //convert it back to json
                fs.writeFileSync('./scrapedoutput/artists/BrainzArtistsSequelize.json', json2, 'utf8');
                console.log("success");
                returnToServerJS();
                // write it back


            }

            var url = "http://musicbrainz.org/ws/2/artist/" + finalArray[elemNum] + "?&fmt=json";

            console.log('request artist started!');

            console.log(url);

            request({
                url: url,
                headers: {
                    'User-Agent': 'ClassicalApp/1.4.0'
                },
                json: true
            }, function (error, response, body) {

                var json = body;
                newObj.table.push({artistId: finalArray[elemNum], aboutartist: json});
                elemNum = elemNum + 1;

            });


        }, 1500)


    },

};





