var request = require("request");
var fs = require('fs');
var cheerio = require('cheerio');
var sleep = require('system-sleep')


module.exports = {
    getArtists: function (finalArray, returnToServerJS) {

        var elemNum = 0;
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
                if (error) {
                    console.log("error getting artist on " + url + " :" + error)
                }
                artists.push(body);


            });
            elemNum = elemNum + 1;
            if (elemNum == finalArray.length) {
                clearInterval(intervalId3);
                console.log("write artists!!!!!!")
                json2 = JSON.stringify(artists); //convert it back to json
                fs.writeFileSync('./scrapedoutput/artists/test123.json', json2, 'utf8');


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

                    artistsAPI.push({
                        name: name,
                        nationality: nationality,
                        dateOfBirth: dateOfBirth,
                        dateOfDeath: dateOfDeath,
                        placeOfBirth: placeOfBirth,
                        placeOfDeath: placeOfDeath,
                        instrument: null,
                        psuedonym: null,
                        work: null,
                        release: null,
                        tag: null,
                        source_link: source_link
                    });


                }
                json2 = JSON.stringify(artistsAPI); //convert it back to json
                fs.writeFileSync('./scrapedoutput/artists/BrainzArtistsSequelize.json', json2, 'utf8');
                returnToServerJS();
                // write it back

            }


        }, 3000)


    },

};





