const path = require('path');
var Sequelize = require('sequelize');
var config = require('./config/postgresConfig.json');

require(path.join(__dirname, "index1.js")).connect(function (context) {
    require(path.join(__dirname, "load_artists.js")).load_artists(context);

});
