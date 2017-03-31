var request = require("request");
var fs = require('fs');

var elemNum = 0;

var newObj = {
    table: []
};

fs.readFile('./scrapedoutput/BrainzIDartists.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
        console.log(err);
    } else {

        obj = JSON.parse(data); //now it an object
        arrayofObj = obj.table;

        var finalArray = arrayofObj.map(function (artistai) {
            return artistai.id;
        });


        setInterval(function () {

            var url = "http://musicbrainz.org/ws/2/release/?query=arid:" + finalArray[elemNum] + "&fmt=json";

            if (elemNum == finalArray.length) {
                json2 = JSON.stringify(newObj); //convert it back to json
                fs.writeFile('./scrapedoutput/BrainzReleases.json', json2, 'utf8', function writeFileCallback(err, data) {
                    process.exit();
                }); // write it back

            }

            console.log(url);

            console.log('request started!');

            request({
                url: url,
                headers: {
                    'User-Agent': 'ClassicalApp/1.4.0 '
                },
                json: true
            }, function (error, response, body) {

                var json = body;
                console.log(json.count);

                newObj.table.push({artistId: finalArray[elemNum], count: json.count, releases: json.releases});
                elemNum = elemNum + 1;

            });

        }, 2000)

    }
});

