var request = require("request");
var fs = require('fs');

var elemNum = 0;

var fruits = [];
var fruitsNew = [];
var finalObject = {
    table: []
}

fs.readFile('recordingsXXXX-XX-XX.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
        console.log(err);
    } else {

        obj = JSON.parse(data); //now it an object
        arrayofObj = obj.table;

        var finalArray = arrayofObj.map(function (artists) {
            return artists.recordings;
        });

        for (var z = 0; z < finalArray.length; z++) {
            for (var i = 0; i < finalArray[z].length; i++) {
                for (var j = 0; j < finalArray[z][i]["artist-credit"].length; j++)
                    fruits.push(finalArray[z][i]["artist-credit"][j].artist.id);
            }
        }

        fs.readFile('IDAllArtists.json', 'utf8', function readFileCallback(err, dataOld) {
            if (err) {
                console.log(err);
            } else {
                NewObj = JSON.parse(dataOld); //now it an object
                arrayofObj = NewObj.table;

                for (z = 0; z < arrayofObj.length; z++) {
                    fruitsNew.push(arrayofObj[z].id);
                }

                var children = fruits.concat(fruitsNew);

                console.log(children.length);


                function removeDuplicates(arr) {
                    var i, ret = [];
                    for (i = 0; i < arr.length; i += 1) {
                        if (ret.indexOf(arr[i]) !== -1) {
                            ret.splice(ret.indexOf(arr[i]), 1);
                        } else {
                            ret.push(arr[i]);
                        }
                    }
                    return ret;
                }

                newAr = removeDuplicates(children);
                console.log(newAr.length);

                for (var e = 0; e < newAr.length; e++) {
                    finalObject.table.push({artistId: newAr[e]});
                }

                json2 = JSON.stringify(finalObject); //convert it back to json
                fs.writeFile('IDArtistsRecordingsFinal2.json', json2, 'utf8', function writeFileCallback(err, data) {
                    process.exit();
                }); // write it back

            }
        })

    }
});


