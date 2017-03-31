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

        obj = JSON.parse(data);
        arrayofObj = obj.table;

        var finalArray = arrayofObj.map(function (artistai) {
            return artistai.id;
        });

        setInterval(function () {

            var url = "http://musicbrainz.org/ws/2/work/?query=arid:" + finalArray[elemNum] + "&fmt=json";

            if (elemNum == finalArray.length) {
                json2 = JSON.stringify(newObj); //convert it back to json
                fs.writeFile('./scrapedoutput/BrainzWorks.json', json2, 'utf8', function writeFileCallback(err, data) {
                    process.send("done");
                    process.exit();
                }); // write it back

            }

            console.log(url);

            request({
                url: url,
                headers: {
                    'User-Agent': 'ClassicApp/1.4.0 '
                },
                json: true
            }, function (error, response, body) {

                var json = body;
                newObj.table.push({artistId: finalArray[elemNum], count: json.count, works: json.works});
                elemNum = elemNum + 1;

            });

        }, 2000)

    }
});


