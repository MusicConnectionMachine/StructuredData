var fs = require("fs");
var artists = "RemovedDuplicates2.json";
var ws = 'works.json';
var rels = 'releases.json';
var wsAPI = 'WorksAPI.json';
var relsAPI = 'ReleasesAPI.json';

var newObj = {};
var musicians = [];
var releases = [];
var work = [];

    // SCRIPT THAT ADDS WORKS AND RELEASES FOREIGN KEYS TO ARTISTS TABLE
    fs.readFile(relsAPI, 'utf8', function readFileCallback(err, data){
        if (err) {
            console.log(err);
            return;
        }

        obj = JSON.parse(data);

        fs.readFile(artists, 'utf8', function readFileCallback(err, data2){
        if (err) {
            console.log(err);
            return;
        }

        ReadArtists = JSON.parse(data2);   

        for (j = 0; j < ReadArtists.length; j++) {
            ReadArtists[j].release = [];
        }  

        for (i = 0; i < obj.length; i++) {
            var releases = [];
            for (z = 0; z < ReadArtists.length; z++) {
                if (obj[i].artistId == ReadArtists[z].artistId) {
                    
                    var word = obj[i].id.toString();
                    ReadArtists[z].release.push(word);
                }

            }
        
        // SCRIPT THAT ADDS ARTISTS ID'S TO WORKS AND RELEASES
        // ===================================================
        //   var counter = obj[i].count;

        //   if (counter > 0) {
        //       for(j = 0; j < counter; j++) {   

        //         if (obj[i].works[j] != null && obj[i].works[j].title != null) { 
        //           console.log(obj[i].works[j].title);
        //           var byArtists = [];

                  
        //           for (z = 0; z < ReadArtists.length; z++) {
        //               if (obj[i].artistId == ReadArtists[z].artistId) {
        //                   byArtists.push(ReadArtists[z].id); 
        //               }
        //           }

                                    

        //           var id = ""+i+""+j+"";
        //           var newObj = {
        //             id: id,
        //             title: obj[i].works[j].title,
        //             artistId: obj[i].artistId,
        //             byartist: byArtists
        //           };
        //           works.push(newObj);
        //         }
        //       }   
        //     }
        //   }
        
            
          }

          json2 = JSON.stringify(ReadArtists); //convert it back to json
            fs.writeFile('ArtistsAPI.json', json2, 'utf8', function writeFileCallback(err, data) {
                process.exit();
            }); // write it back
          
          
        });
    });





