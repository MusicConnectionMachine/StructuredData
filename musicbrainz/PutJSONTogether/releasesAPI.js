var fs = require("fs");
console.log("\n *START* \n");
var content = "./scrapedoutput/BrainzReleases.json";

var newObj = {};
var releases = [];

    
fs.readFile(content, 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
        obj = JSON.parse(data); //now it an object

        for(i = 0; i < obj.table.length; i++) {
            var counter = obj.table[i].count;
            for(j = 0; j < counter; j++) {
                newObj = {};
                if (obj.table[i].releases[j] != null) {
                    newObj.title = obj.table[i].releases[j].title;
                    releases.push(newObj);
                }     
            }    
        }
                    
    }
    
    json2 = JSON.stringify(releases); //convert it back to json
    fs.writeFile('./scrapedoutput/BrainzReleasesSequelize.json', json2, 'utf8', function writeFileCallback(err, data) {
        process.send("done");
        process.exit();
    }); // write it back

});
