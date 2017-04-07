var request = require("request");
var fs = require('fs');
var intervalId2 = null;

var newObj2 = {};
var releasesAPI = [];

module.exports = {
  getReleases: function(finalArray) {

    var elemNum = 0;

    var newObj = {
        table: []
    };

 intervalId2 = setInterval(function () {

        if (elemNum == finalArray.length) {

            clearInterval(intervalId2);

            obj = newObj;

            for(i = 0; i < obj.table.length; i++) {
            var counter = obj.table[i].count;
                for(j = 0; j < counter; j++) {
                    newObj2 = {};
                    if (obj.table[i].releases[j] != null) {
                        newObj2.title = obj.table[i].releases[j].title;
                        releasesAPI.push(newObj2);
                    }     
                }    
            }

            json2 = JSON.stringify(releasesAPI); //convert it back to json
            fs.writeFile('./scrapedoutput/BrainzReleasesSequelize.json', json2, 'utf8', function writeFileCallback(err, data) {
                process.send("done from Releases");
                process.exit();
            }); // write it back


        }

        var url = "http://musicbrainz.org/ws/2/release/?query=arid:" + finalArray[elemNum] + "&fmt=json";

        console.log(url);

        console.log('request Release started!');

        request({
            url: url,
            headers: {
                'User-Agent': 'ClassicalMusicApp/1.2.0 '
            },
            json: true
        }, function (error, response, body) {

            var json = body;

            newObj.table.push({artistId: finalArray[elemNum], count: json.count, releases: json.releases});
            elemNum = elemNum + 1;

        });


    }, 1500)


  },
       
};





