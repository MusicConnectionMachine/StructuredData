const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const sleep = require('system-sleep');
var jsesc = require('jsesc');
const replaceURLAndUnderscore = require('./helper/replaceURLAndUnderscore');

var newObj = [];
var url = [],
    link = [];
url.push('http://dbpedia.org/page/Category:17th-century_classical_composers');
url.push('http://dbpedia.org/page/Category:18th-century_classical_composers');

console.log("---dbPedia_Composers.js started!---")

var counter = 0;
url.forEach(function (value) {
    getURL(value, function () {
        counter++;
        if (counter == url.length) {
            fs.writeFileSync('./scrapedoutput/artists/dbPedia_Composers.json', JSON.stringify(newObj), 'utf-8');
            process.send("done dbPedia_Composers.js");
        }
    });
});


function getURL(value, callback) {
    request(jsesc(value), function (error, response, html) {
        if (error) {
            console.log("dbPedia_Composers.js getURL: " + error);
            return
        }
        var $ = cheerio.load(html);
        $('a[rev="dct:subject"]').each(function (i, element) {
            var a = $(this);
            var queryURL = a.attr('href');
            link.push(queryURL);
        });
        link.forEach(function (value) {
            getArtist(value);
            sleep(1000);
        });

        callback();

    });
}

function getArtist(source_link) {
    request(jsesc(source_link), function (error, response, html) {

        if (error) {
            console.log("dbPedia_Composers.js getArtist: " + error);
            return
        }
        var $ = cheerio.load(html);

        //name
        name = $('span[property="dbp:name"]').text();
        if (!name) {
            var name = (replaceURLAndUnderscore(source_link)).split("(");
            name = name[0].trim();
        }
        var nationality = $('span[property="dbo:nationality"]').text().trim();
        if (nationality.length == 0)
            nationality = null;


        var scrapedbpediaProperties = require('./helper/scrapedbpediaProperties.js');

        var scrapedData = scrapedbpediaProperties($);

        //only add artist if he hasn't been added
        if (!newObj.some(function (element) {
                return element.source_link == source_link;
            })) {
            newObj.push({
                name: name,
                artist_type: 'composer',
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

