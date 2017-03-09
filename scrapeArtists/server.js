const http = require('http');
var request = require("request");
var fs = require('fs');
var async = require('async');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);

  var elemNum = 0;

  var newObj = {
    table: []
  };

  fs.readFile('IDArtistsRecordingsFinal2.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
      
      obj = JSON.parse(data); //now it an object
      arrayofObj = obj.table;

      var finalArray = arrayofObj.map(function (artistai) {
        return artistai.artistId;
      });

       setInterval(function(){      

            var url = "http://musicbrainz.org/ws/2/artist/"+finalArray[elemNum]+"?&fmt=json";

            if (elemNum == finalArray.length) {
               json2 = JSON.stringify(newObj); //convert it back to json
               fs.writeFile('artistsFromRecordings.json', json2, 'utf8', function writeFileCallback(err, data) {
                  process.exit();
               }); // write it back
               
            }

            console.log(url);

            console.log('request started!');
            
            request({
                url: url,
                headers: {
                'User-Agent': 'ClassicalApp/1.4.0 ( tumiss@gmail.com )'
                },
                json: true
            }, function (error, response, body) {

                    var json = body;
                    newObj.table.push({artistId: finalArray[elemNum], aboutartist: json});
                    elemNum = elemNum + 1;
                      
            });

        }, 1800)

      }});
      
})

        