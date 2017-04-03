/////////////////////EXTRACTS 21st,20th,19th,18th and 17th Century classical musicians///////////////
var fs = require('fs');
var sleep = require('system-sleep');
var request = require("request");
var cheerio = require('cheerio');
var jsesc = require('jsesc');
const replaceURLAndUnderscore = require('./helper/replaceURLAndUnderscore');

var url = [],
    musicians = [];
url.push("http://dbpedia.org/page/Category:21st-century_classical_musicians");
url.push("http://dbpedia.org/page/Category:20th-century_classical_musicians");
url.push("http://dbpedia.org/page/Category:19th-century_classical_musicians");
url.push("http://dbpedia.org/page/Category:18th-century_classical_musicians");
url.push("http://dbpedia.org/page/Category:17th-century_classical_musicians");
console.log("---dbpedia_Classical_musicians_by_century.js started!---")

var counter = 0
url.forEach(function (value) {
    scrapeCategory(value, function () {
        counter++;
        if (counter == url.length) {
            var json2 = JSON.stringify(musicians); //convert it back to json
            fs.writeFileSync('./scrapedoutput/artists/dbpedia_Classical_musicians_by_century.json', json2, 'utf8'); // write it back
            process.send("done dbpedia_Classical_musicians_by_century.js");
        }
    });
});


function scrapeCategory(link1, callback) {
    request(link1, function (error, response, body) {
        var source_link = []
        if (error) {
            console.log("dbpedia_Classical_musicians_by_century.js scrapeCategory: " + error);
            return
        }
        $ = cheerio.load(body);

        $('a[rev="dct:subject"]').each(function (i, element) {
            var a = $(this);
            source_link.push(a.attr('href'));
        });

        source_link.forEach(function (value) {
            scrapeArtist(value);
            sleep(1000);
        });
        callback();


    });
}


function scrapeArtist(source_link) {
    request(jsesc(source_link), function (error, response, body) {
        if (error) {
            console.log("dbpedia_Classical_musicians_by_century.js scrapeArtist: " + error);
            return
        }
        $ = cheerio.load(body);
        var split_name = (replaceURLAndUnderscore(source_link)).split("(");

        var nationality = $('span[property="dbo:nationality"]').text().trim();
        if (nationality.length == 0)
            nationality = null;

        var scrapedbpediaProperties = require('./helper/scrapedbpediaProperties.js');

        var scrapedData = scrapedbpediaProperties($);

        //only add artist if he hasn't been added
        if (!musicians.some(function (element) {
                return element.source_link == source_link;
            })) {

            musicians.push({
                name: split_name[0].trim(),
                artist_type: 'musician',
                nationality: nationality,
                source_link: source_link,
                dateOfBirth: scrapedData.dateOfBirth,
                dateOfDeath: scrapedData.dateOfDeath,
                placeOfBirth: scrapedData.placeOfBirth,
                placeOfDeath: scrapedData.placeOfDeath,
                instrument: scrapedData.instrument,
                pseudonym: scrapedData.pseudonym,
                work: scrapedData.work,
                release: scrapedData.release,
                tags: scrapedData.tags,
                wiki_link: scrapedData.wiki_link,
                wiki_pageid: scrapedData.wiki_pageid


            });
        }
    });
}
