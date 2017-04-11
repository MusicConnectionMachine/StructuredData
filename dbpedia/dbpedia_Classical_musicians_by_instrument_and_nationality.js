/////////////////////EXTRACTS ALL CLASSICAL MUSICIANS BY INSTRUMENTS AND NATIONALITY///////////////
module.exports = function (returnToMaster) {
    var fs = require('fs');
    var sleep = require('system-sleep');
    var request = require("request");
    var cheerio = require('cheerio');
    var jsesc = require('jsesc');
    const replaceURLAndUnderscore = require('./helper/replaceURLAndUnderscore');

    const outputFile = "./scrapedoutput/dbpedia/dbpedia_Classical_musicians_by_instruments_and_nationality.json";

    var musicians = [],
        temp_list = [],
        temp_list1 = [],
        temp_list2 = [],
        temp_list3 = [],
        source_link = [],
        source_sub_link = [];
    var url = [],
        k = 1;


    url.push("http://dbpedia.org/page/Category:Classical_musicians_by_instrument_and_nationality");
    console.log("---dbpedia_Classical_musicians_by_instrument_and_nationality.js started!---")

    url.forEach(function (value) {
        scrapeURL(value);
    });

    function scrapeURL(link1) {
        request(link1, function (error, response, body) {
            if (error) {
                console.log("dbpedia_Classical_musicians_by_instrument_and_nationality.js scrapeURL: " + error);
                return
            }
            $ = cheerio.load(body);
            $('a[rev="skos:broader"]').each(function (i, element) {
                var a = $(this);
                temp_list.push(a.attr('href'));
            });
            temp_list1 = temp_list;
            temp_list = [];
            temp_list1.forEach(function (value) {
                scrapeMainCat(value);
                sleep(2000);

            });
            temp_list2 = temp_list;
            temp_list = [];

            temp_list2.forEach(function (value) {
                scrapeMainCat(value);
                sleep(1000);
            });

            temp_list3 = temp_list;
            temp_list = [];

            temp_list3.forEach(function (value) {
                scrapeSubCat(value);
                sleep(1000);
            });

            source_link.forEach(function (value) {
                scrapeArtist(value);
                sleep(1000);
            });
            jsonOutput = JSON.stringify(musicians); //convert it back to json
            fs.writeFileSync(outputFile, jsonOutput, 'utf8'); // write it back
            returnToMaster();

        });
    }


    function scrapeMainCat(value2) {
        request(value2, function (error, response, body) {
            if (error) {
                console.log("dbpedia_Classical_musicians_by_instrument_and_nationality.js scrapeMainCat: " + error);
                return
            }
            $ = cheerio.load(body);
            $('a[rev="skos:broader"]').each(function (i, element) {
                var a = $(this);
                temp_list.push(a.attr('href'));
            });

        });
    }

    function scrapeSubCat(linkNationality) {
        request(linkNationality, function (error, response, body) {
            if (error) {
                console.log("dbpedia_Classical_musicians_by_instrument_and_nationality.js scrapeSubCat: " + error);
                return
            }
            $ = cheerio.load(body);
            $('a[rev="dct:subject"]').each(function (i, element) {
                var a = $(this);
                var nationality = linkNationality.replace("http://dbpedia.org/page/Category:", "").replace("http://dbpedia.org/resource/Category:", "");
                nationality = nationality.slice(0, nationality.indexOf("classical")).replace(new RegExp("_", 'g'), "").replace("fortepianist", "");
                source_link.push({
                    linkMusician: a.attr('href'),
                    nationality: nationality
                });
            });

        });
    }

    function scrapeArtist(linkMusicianAndNationality) {
        console.log("dbpedia_Classical_musicians_by_instrument_and_nationality.js scraping artist");
        request(jsesc(linkMusicianAndNationality.linkMusician), function (error, response, body) {

            if (error) {
                console.log("dbpedia_Classical_musicians_by_instrument_and_nationality.js scrapeArtist: " + error);
                return
            }

            $ = cheerio.load(body);

            var split_name = (replaceURLAndUnderscore(linkMusicianAndNationality.linkMusician)).split("(");
            var nationality = linkMusicianAndNationality.nationality;
            if (nationality.length == 0)
                nationality = null;

            var scrapedbpediaProperties = require('./helper/scrapedbpediaProperties.js');

            var scrapedData = scrapedbpediaProperties($);


            musicians.push({
                name: split_name[0].trim(),
                artist_type: 'musician',
                nationality: nationality,
                source_link: linkMusicianAndNationality,
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


        });
    }
};
