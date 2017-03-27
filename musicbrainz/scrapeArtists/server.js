var request = require("request");

  var listOfIDs = getIDs();
  var artistInfo = getArtistInfo(listOfIDs);


function getArtistInfo(listOfIDs) {

    arrayofObj = listOfIDs.table;

    var elemNum = 0;
    var newObj = {
      table: []
    };

    var finalArray = arrayofObj.map(function (artistai) {
      return artistai.artistId;
    });

    setInterval(function(){      

      var url = "http://musicbrainz.org/ws/2/artist/"+finalArray[elemNum]+"?&fmt=json";

      if (elemNum == finalArray.length) {
          return newObj; // return information about the artist after finished iterating
      }

      request({
          url: url,
          headers: {
          'User-Agent': 'ClassicalApp/1.4.0'
          },
          json: true
      }, function (error, response, body) {

          var json = body;
          newObj.table.push({artistId: finalArray[elemNum], aboutartist: json});
          elemNum = elemNum + 1;
                
      });

    }, 1800)
}


  function getIDs() {
  var date = 1620
  var obj = {
    table: []
  };

  setInterval(function(){

    if(date == 1821) {
      return obj;
    }

    var url = "http://musicbrainz.org/ws/2/artist/?query=begin:"+date+"&fmt=json";

    request({
        url: url,
        headers: {
        'User-Agent': 'ClassicalMusic/1.5.0 '
        },
        json: true
    }, function (error, response, body) {

          var json = body;
          var counter = json.count;

          if (counter > 0) {

            for (var z = 0; z < counter; z++) {
              artist = json.artists[z];    
              obj.table.push({id: artist.id});
            }  
          } 

          date = date + 1;               
              
    });
      
  }, 2000)
  }

        