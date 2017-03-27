var request = require("request");
var fs = require('fs');

var elemNum = 0;

var newObj = {
    table: []
};

fs.readFile('IDartistsOther.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
        console.log(err);
    } else {

        obj = JSON.parse(data); //now it an object
        arrayofObj = obj.table;

        var finalArray = arrayofObj.map(function (artistai) {
            return artistai.id;
        });

        setInterval(function () {

            var url = "http://musicbrainz.org/ws/2/recording/?query=arid:" + finalArray[elemNum] + "&fmt=json";

            if (elemNum == 5) {
                json2 = JSON.stringify(newObj); //convert it back to json
                fs.writeFile('recordingsTEST.json', json2, 'utf8', function writeFileCallback(err, data) {
                    process.exit();
                }); // write it back

            }

            console.log(url);

            console.log('request started!');

            request({
                url: url,
                headers: {
                    'User-Agent': 'ClassicalMusicApp/1.2.0 '
                },
                json: true
            }, function (error, response, body) {

                var json = body;

                newObj.table.push({artistId: finalArray[elemNum], count: json.count, recordings: json.recordings});
                elemNum = elemNum + 1;

            });


        }, 2000)

    }
});



