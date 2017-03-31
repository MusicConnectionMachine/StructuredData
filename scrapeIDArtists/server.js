var request = require("request");
var fs = require('fs');

var obj = {
    table: []
};

var date = 1620;

setInterval(function () {
    // once all requests for the year 1620 until 1820 are executed, convert the outputobject into json and write it to file
    if (date == 1821) {
        json2 = JSON.stringify(obj); //convert it back to json
        fs.writeFile('./scrapedoutput/BrainzIDartists.json', json2, 'utf8', function writeFileCallback(err, data) {
            process.send("done");
            process.exit();
        }); // write it back
    }

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

    });


}, 3000)
