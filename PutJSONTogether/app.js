var fs = require("fs");
console.log("\n *START* \n");
var content = "artists.json";

function convertToInformation(content) {
    fs.readFile(content, 'utf8', function readFileCallback(err, data) {
        let musicians = [];
        if (err) {
            console.log(err);
            return;
        }

        obj = JSON.parse(data); //now it an object
        arrayofObj = obj.table.length;

        for (i = 0; i < obj.table.length; i++) {
            if (obj.table[i].hasOwnProperty("aboutartist")) {
                let newObj = {
                    nationality: null,
                    dateOfBirth: null,
                    dateOfDeath: null,
                    placeOfBirth: null,
                    placeOfDeath: null,
                    instrument: null,
                    psuedonym: null,
                    work: null,
                    release: null,
                    tag: null
                };
                let aboutArtist = obj.table[i].aboutartist;
                newObj.name = aboutArtist.name;
                newObj.source_link = "https://musicbrainz.org/artist/" + obj.table[i].artistId;

                if (aboutArtist.hasOwnProperty("life-span")) {
                    if (aboutArtist["life-span"].hasOwnProperty("begin") && aboutArtist["life-span"].begin != null) {
                        newObj.dateOfBirth = aboutArtist["life-span"].begin;
                    }
                    if (aboutArtist["life-span"].hasOwnProperty("end") && aboutArtist["life-span"].end != null) {
                        newObj.dateOfBirth = aboutArtist["life-span"].end;
                    }
                }

                if (aboutArtist.hasOwnProperty("area") && aboutArtist.area != null) {
                    newObj.placeOfBirth = aboutArtist.area.name;
                }

                if (aboutArtist.hasOwnProperty("end_area") && aboutArtist["end_area"] != null) {
                    newObj.placeOfDeath = aboutArtist["end_area"].name;
                }

                musicians.push(newObj);
            }
        }
        return musicians;
    });
}



