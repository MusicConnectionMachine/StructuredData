/////////////////////EXTRACTS ALL CLASSICAL MUSICIANS BY INSTRUMENT///////////////
var fs = require('fs');
var sleep = require('system-sleep');
var request = require("request");
var cheerio = require('cheerio');
var jsesc = require('jsesc');
const replaceURLAndUnderscore = require('./helper/replaceURLAndUnderscore');
var temp_list = [],
    source_link = [],
    musicians = [],
    url = [];
url.push("http://dbpedia.org/page/Category:Classical_musicians_by_instrument");
console.log("---dbpedia_Classical_musicians_by_instrument.js started!---")

url.forEach(function (value) {
    scrapeURL(value);
});

function scrapeURL(link1) {
    request(link1, function (error, response, body) {
        if (error) {
            console.log("dbpedia_Classical_musicians_by_instrument.js scrapeURL: " + error);
            return
        }

        $ = cheerio.load(body);
        $('a[rev="skos:broader"]').each(function (i, element) {
            var a = $(this);
            temp_list.push(a.attr('href'));
        });

        temp_list.forEach(function (value) {
            scrapeCat(value);
            sleep(2000);

        });
        source_link.forEach(function (value) {
            scrapeArtist(value);
            sleep(1000);
        });
        json2 = JSON.stringify(musicians); //convert it back to json
        fs.writeFileSync('./scrapedoutput/artists/dbpedia_Classical_musicians_by_instruments.json', json2, 'utf8'); // write it back
        process.send("done dbpedia_Classical_musicians_by_instrument.js");


    });
}


function scrapeCat(value2) {
    request(value2, function (error, response, body) {
        if (error) {
            console.log("dbpedia_Classical_musicians_by_instrument.js scrapeCat: " + error);
            return
        }
        $ = cheerio.load(body);
        $('a[rev="dct:subject"]').each(function (i, element) {
            var a = $(this);
            source_link.push(a.attr('href'));
        });

    });
}


function scrapeArtist(value2) {
    request(jsesc(value2), function (error, response, body) {
        if (error) {
            console.log("dbpedia_Classical_musicians_by_instrument.js scrapeArtist: " + error);
            return
        }
        $ = cheerio.load(body);
        var split_name = (replaceURLAndUnderscore(value2)).split("(");
        var nationality = $('span[property="dbo:nationality"]').text().trim();
        if (nationality.length == 0)
            nationality = null;

        var scrapedbpediaProperties = require('./helper/scrapedbpediaProperties.js');

        var scrapedData = scrapedbpediaProperties($);

        musicians.push({
            name: split_name[0].trim(),
            artist_type: 'musician',
            nationality: nationality,
            source_link: value2,
            scrapedData
        });
    });
}
