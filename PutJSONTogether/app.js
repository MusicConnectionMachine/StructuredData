var fs = require("fs");
console.log("\n *START* \n");
var content = "artists.json";

var musicians = [];
var newObj = {};

function convertToInformation(content) {
    fs.readFile(content, 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            obj = JSON.parse(data); //now it an object
            arrayofObj = obj.table.length;

            for(i = 0; i < obj.table.length; i++) {
                newObj = {};
                if (obj.table[i].hasOwnProperty("aboutartist")) {
                    newObj.name = obj.table[i].aboutartist.name;
                    newObj.nationality = null;

                    if (obj.table[i].aboutartist.hasOwnProperty("life-span")) {
                        if(obj.table[i].aboutartist["life-span"].hasOwnProperty("begin")) {
                            if (obj.table[i].aboutartist["life-span"].begin != null) {
                                newObj.dateOfBirth = obj.table[i].aboutartist["life-span"].begin;
                            } else { newObj.dateOfBirth = null; } 
                        } else { newObj.dateOfBirth = null; }
                    } else { newObj.dateOfBirth = null; }

                    if (obj.table[i].aboutartist.hasOwnProperty("life-span")) {
                        if(obj.table[i].aboutartist["life-span"].hasOwnProperty("end")) {
                            if (obj.table[i].aboutartist["life-span"].end != null) {
                                newObj.dateOfDeath = obj.table[i].aboutartist["life-span"].end;
                            } else { newObj.dateOfDeath = null; } 
                        } else { newObj.dateOfDeath = null; }
                    } else { newObj.dateOfDeath = null; }

                    if(obj.table[i].aboutartist.hasOwnProperty("area")) {
                        if (obj.table[i].aboutartist.area != null) {
                            newObj.placeOfBirth = obj.table[i].aboutartist.area.name;
                        } else { newObj.placeOfBirth = null; }
                    } else { newObj.placeOfBirth = null; }

                    if(obj.table[i].aboutartist.hasOwnProperty("end_area")) {
                        if (obj.table[i].aboutartist["end_area"] != null) {
                            newObj.placeOfDeath = obj.table[i].aboutartist["end_area"].name;
                        } else { newObj.placeOfDeath = null; }
                    } else { newObj.placeOfDeath = null; }


                    newObj.instrument = null;
                    newObj.psuedonym = null;
                    newObj.work = null;
                    newObj.release = null;
                    newObj.tag = null;
                    newObj.source_link = "https://musicbrainz.org/artist/"+obj.table[i].artistId;    

                    musicians.push(newObj);
                    
                }
                
            }

            return musicians;
        }
    });
}



