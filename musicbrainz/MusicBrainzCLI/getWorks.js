var request = require("request");
var fs = require('fs');
var intervalId2 = null;

var newObj2 = {};
var worksAPI = [];

module.exports = {
  getWorks: function(finalArray) {

    var elemNum = 0;

    var newObj = {
        table: []
    };

 intervalId2 = setInterval(function () {

        if (elemNum == 5) {

            clearInterval(intervalId2);

            obj = newObj;

            for(i = 0; i < obj.table.length; i++) {
            var counter = obj.table[i].count;
                for(j = 0; j < counter; j++) {
                    newObj2 = {};
                    if (obj.table[i].works[j] != null) {
                        newObj2.title = obj.table[i].works[j].title;
                        worksAPI.push(newObj2);
                    }     
                }    
            }

            json2 = JSON.stringify(worksAPI); //convert it back to json
            fs.writeFile('./scrapedoutput/BrainzWorksSequelize.json', json2, 'utf8', function writeFileCallback(err, data) {
                process.send("done from works");
                process.exit();
            }); // write it back


        }

        var url = "http://musicbrainz.org/ws/2/work/?query=arid:" + finalArray[elemNum] + "&fmt=json";

        console.log(url);

        console.log('request Work started!');

        request({
            url: url,
            headers: {
                'User-Agent': 'ClassicalMusicApp/1.3.0 '
            },
            json: true
        }, function (error, response, body) {

            var json = body;

            newObj.table.push({artistId: finalArray[elemNum], count: json.count, works: json.works});
            elemNum = elemNum + 1;

        });


    }, 1500)


  },
       
};





