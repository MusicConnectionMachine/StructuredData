var request = require("request");
var fs = require('fs');
var getReleases = require("./getReleases.js");
var getWorks = require("./getWorks.js");
var getArtists = require("./getArtists.js");


var obj = {
    table: []
};

var date = 1620;


var intervalId = setInterval(function () {
    // once all requests for the year 1620 until 1820 are executed, convert the outputobject into json and write it to file

    var url = "http://musicbrainz.org/ws/2/artist/?query=begin:" + date + "&fmt=json";

    console.log("requesting: " + url);

    request({
        url: url,
        headers: {
            'User-Agent': 'ClassicalMusic/1.5.0 '
        },
        json: true
    }, function (error, response, body) {

        var json = body;
        var counter = json.count;
        console.log("number of artists born in " + date + ": " + counter);

        if (counter > 0) {

            // iterate through all entries and push them to the array obj.table
            for (var z = 0; z < counter; z++) {
                artist = json.artists[z];

                obj.table.push({
                    id: artist.id,
                    type: artist.type,
                    name: artist.name,
                    country: artist.country,
                    date: date
                });
            }
        }
        date = date + 1;
        if (date == 1821) {

            clearInterval(intervalId);

            arrayofObj = obj.table;
            var finalArray = arrayofObj.map(function (artistai) {
                return artistai.id;
            });

            var finishedscrapers = 0;
            getReleases.getReleases(finalArray, function () {
                finishedscrapers++;
                if (finishedscrapers === 3) {
                    console.log("finished scraping musicbrainz")
                }
            });
            getWorks.getWorks(finalArray, function () {
                finishedscrapers++;
                if (finishedscrapers === 3) {
                    console.log("finished scraping musicbrainz")
                }
            });
            getArtists.getArtists(finalArray, function () {
                finishedscrapers++;
                if (finishedscrapers === 3) {
                    console.log("finished scraping musicbrainz")
                }
            });

        }
    });


}, 3000)
