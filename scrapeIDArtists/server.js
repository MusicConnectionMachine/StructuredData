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

  var obj = {
    table: []
  };

  // obj.table.push({id: 1, type:"person", name:"Lukas Music Star", country: "LT"});
  // var json = JSON.stringify(obj);
  // fs.writeFile('artistYYYY.json', json, 'utf8');

  // var start = new Date("1620-11-20"); //yyyy-mm-dd
  // var end = new Date("1719-04-01"); //yyyy-mm-dd
  var date = 1620

       setInterval(function(){

            if(date == 1821) {
              json2 = JSON.stringify(obj); //convert it back to json
              fs.writeFile('artistYYYY.json', json2, 'utf8', function writeFileCallback(err, data) {
                  process.exit();
              }); // write it back
            }

            // var mm = ((start.getMonth()+1)>=10)?(start.getMonth()+1):'0'+(start.getMonth()+1);
            // var dd = ((start.getDate())>=10)? (start.getDate()) : '0' + (start.getDate());
            // var yyyy = start.getFullYear();
            // var date = yyyy+"-"+mm+"-"+dd; //yyyy-mm-dd

            

            var url = "http://musicbrainz.org/ws/2/artist/?query=begin:"+date+"&fmt=json";

            console.log(url);

            console.log('request started!');
            
            request({
                url: url,
                headers: {
                'User-Agent': 'ClassicalMusic/1.5.0 ( laucius@gmail.com )'
                },
                json: true
            }, function (error, response, body) {

                    var json = body;
                    var counter = json.count;
                    console.log(counter);

                    if (counter > 0) {
          
                      // obj = JSON.parse(data); //now it an object
                        for (var z = 0; z < counter; z++) {
                          artist = json.artists[z];
                          
                          obj.table.push({id: artist.id, type:artist.type, name:artist.name, country:artist.country, date:date});
                      }  
                   } 

                   date = date + 1;
                   
                      
            });
   
          
        }, 3000)



})

        