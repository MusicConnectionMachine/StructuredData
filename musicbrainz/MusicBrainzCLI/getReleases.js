var request = require("request");
var fs = require('fs');


module.exports = {
    getReleases: function (finalArray, returnToServerJS) {

        var elemNum = 0;
        var requestCounter = 0;
        var releasesAPI = [];
        var artists = [];

        var intervalId2 = setInterval(function () {
            var url = "http://musicbrainz.org/ws/2/release/?query=arid:" + finalArray[elemNum] + "&fmt=json";
            console.log('request releases for artist ' + finalArray[elemNum]);

            request({
                url: url,
                headers: {
                    'User-Agent': 'ClassicalMusicApp/1.2.0 '
                },
                json: true
            }, function (error, response, body) {
                requestCounter++;
                if (error) {
                    console.log("getReleases request error: " + error);
                }
                if (body && body.error) {
                    console.log("getReleases body error: " + body.error);
                }
                if (body && !body.error) {
                    var json = body;
                    artists.push({artistId: finalArray[elemNum], count: json.count, releases: json.releases});
                }

                if (requestCounter == finalArray.length) {
                    console.log("finished scraping releases")
                    for (i = 0; i < artists.length; i++) {
                        var counter = artists[i].count;
                        for (j = 0; j < counter; j++) {
                            var releaseObject = {};
                            if (artists[i].releases[j] != null) {
                                var currReleases = artists[i].releases[j]
                                releaseObject.title = artists[i].releases[j].title;
                                releaseObject.format = artists[i].releases[j].media[0].format;
                                releaseObject.date = artists[i].releases[j].date;
                                releaseObject.country = artists[i].releases[j]["label-info"][0].label.name;
                                releaseObject.label = artists[i].releases[j].title;
                                releasesAPI.push({
                                    title: currReleases.title,
                                    format: currReleases.media[0].format,
                                    date: currReleases.date,
                                    country: currReleases.country,
                                    label: currReleases["label-info"][0].label.name,
                                    musicbrainzArtistId: artists[i].artistId
                                });
                            }
                        }
                    }
                    json2 = JSON.stringify(releasesAPI); //convert it back to json
                    fs.writeFile('./scrapedoutput/releases/BrainzReleasesSequelize.json', json2, 'utf8', function writeFileCallback(err, data) {
                        console.log("finished writing releases")
                        returnToServerJS();
                    }); // write it back
                }
            });
            elemNum = elemNum + 1;
            if (elemNum == finalArray.length) {
                clearInterval(intervalId2);
            }
        }, 3000)
    },
};





