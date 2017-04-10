module.exports = function (returnToMaster) {
    var request = require("request");
    var fs = require('fs');
    var getReleases = require("./getReleases.js");
    var getWorks = require("./getWorks.js");
    var getArtists = require("./getArtists.js");


    var artistIDs = [];

    var queryBegin = 1620;
    var queryEnd = 1820;


    var queryCounter = queryBegin;
    var requestCounter = queryBegin;

    var intervalId = setInterval(function () {

        var url = "http://musicbrainz.org/ws/2/artist/?query=begin:" + queryCounter + "&fmt=json";

        console.log("requesting: " + url);

        request({
            url: url,
            headers: {
                'User-Agent': 'ClassicalMusic/1.5.0 '
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
                var json = body;
                var counter = json.count;
                console.log("number of artists born in " + (requestCounter - 1) + ": " + counter);

                if (counter > 0) {

                    // iterate through all entries and push them to the array obj.table
                    for (var z = 0; z < counter; z++) {
                        artistIDs.push({
                            id: json.artists[z].id
                        });
                    }
                }
            }

            if (requestCounter == queryEnd) {
                fs.writeFile('./scrapedoutput/artists/BrainzArtistsSequelize.json', JSON.stringify(artistIDs), 'utf8', function writeFileCallback(err, data) {
                    console.log("musicbrainz finished writing artists")
                }); // write it back


                var finalArray = artistIDs.map(function (artistai) {
                    return artistai.id;
                });

                var finishedscrapers = 0;
                getArtists.getArtists(finalArray, function () {
                    finishedscrapers++;
                    if (finishedscrapers === 3) {
                        console.log("musicbrainz finished writing artists");
                        returnToMaster();
                    }
                });
                getReleases.getReleases(finalArray, function () {
                    console.log("musicbrainz finished writing releases");
                    finishedscrapers++;
                    if (finishedscrapers === 3) {
                        returnToMaster();
                    }
                });
                getWorks.getWorks(finalArray, function () {
                    console.log("musicbrainz finished writing works");
                    finishedscrapers++;
                    if (finishedscrapers === 3) {
                        returnToMaster();
                    }
                });


            }
        });
        queryCounter = queryCounter + 1;
        if (queryCounter == queryEnd) {
            clearInterval(intervalId);

        }


    }, 1500)
};

