var request = require("request");
var fs = require('fs');


module.exports = {
    getWorks: function (finalArray, returnToServerJS) {

        var elemNum = 0;
        var requestCounter = 0;
        var worksAPI = [];
        var artists = [];

        var intervalId2 = setInterval(function () {
            var url = "http://musicbrainz.org/ws/2/work/?query=arid:" + finalArray[elemNum] + "&fmt=json";
            console.log('request works for artist ' + finalArray[elemNum]);

            request({
                url: url,
                headers: {
                    'User-Agent': 'ClassicalMusicApp/1.3.0 '
                },
                json: true
            }, function (error, response, body) {
                requestCounter++;
                if (error) {
                    console.log("getWorks request error: " + error);
                }
                if (body && body.error) {
                    console.log("getWorks body error: " + body.error);
                }
                if (body && !body.error) {
                    var json = body;
                    artists.push({artistId: finalArray[requestCounter], count: json.count, works: json.works});
                }

                if (requestCounter == finalArray.length) {
                    console.log("finished scraping works")
                    for (i = 0; i < artists.length; i++) {
                        var counter = artists[i].count;
                        for (j = 0; j < counter; j++) {
                            var artistId;
                            var works = artists[i].works[j];
                            if (works != null) {
                                var relations = works.relations;
                                relations.forEach(function (relation) {
                                    if (relation.type == "composer") {
                                        artistId = relation.artist.id;
                                    }
                                });
                                worksAPI.push({
                                    title: works.title,
                                    composer: artistId
                                });
                            }
                        }
                    }
                    json2 = JSON.stringify(worksAPI); //convert it back to json
                    fs.writeFile('./scrapedoutput/musicbrainz/WorksMusicBrainz.json', json2, 'utf8', function writeFileCallback(err, data) {
                        console.log("finished writing works")
                        returnToServerJS();
                    }); // write it back
                }
            });
            elemNum = elemNum + 1;
            if (elemNum == finalArray.length) {
                clearInterval(intervalId2);
            }
        }, 1200)
    },
};





