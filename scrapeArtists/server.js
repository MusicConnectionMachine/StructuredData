var request = require("request");
var fs = require('fs');

var elemNum = 0;

var newObj = {
    table: []
};

fs.readFile('IDArtistsRecordingsFinal2.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
        console.log(err);
    } else {

        obj = JSON.parse(data); //now it an object
        arrayofObj = obj.table;

        var finalArray = arrayofObj.map(function (artistai) {
            return artistai.artistId;
        });

        setInterval(function () {

            var url = "http://musicbrainz.org/ws/2/artist/" + finalArray[elemNum] + "?&fmt=json";

            if (elemNum == finalArray.length) {
                json2 = JSON.stringify(newObj); //convert it back to json
                fs.writeFile('artistsFromRecordings.json', json2, 'utf8', function writeFileCallback(err, data) {
                    process.exit();
                }); // write it back

            }

            console.log("requesting: " + url);


            request({
                url: url,
                headers: {
                    'User-Agent': 'ClassicalApp/1.4.0 '
                },
                json: true
            }, function (error, response, body) {
                console.log("adding " + body.name);
                var json = body;
                newObj.table.push({artistId: finalArray[elemNum], aboutartist: json});
                elemNum = elemNum + 1;

            });

        }, 1800)

    }
});



