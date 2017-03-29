module.exports = {
    load_artists: function(context) {
        var fs = require("fs");
        var artists = context.component('models').module('artists');
        fs.readFile('./dbPedia_Composers.json', function(err, data) {
            var jsonContent = JSON.parse(data);
            artists.bulkCreate(jsonContent).then(function() {
            }).catch(function(error) {
                console.log("error: " + error);
            })
        });
    }
