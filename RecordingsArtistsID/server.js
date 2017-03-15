var request = require("request");
var fs = require('fs');

var elemNum = 0;


var fruitsNew = [];
var finalObject = {
    table: []
}

if (fruits.length <= 0) {
    fruits = getRecordingsArtist();
    computeDuplicates(fruits);
} else {
    var uniqueIDs = computeDuplicates(fruits);
}

  
function computeDuplicates(fruits) {
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

            for (var e = 0; e < newAr.length; e++) {
                finalObject.table.push({artistId: newAr[e]});
            }

            return finalObject;

        }
    })
}


function getRecordingsArtist() {
    fs.readFile('recordingsXXXX-XX-XX.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {

            fruits = [];
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

            return fruits;
        }
    });
}