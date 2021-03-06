module.exports = function (returnToMaster) {
    var request = require('request');
    var cheerio = require('cheerio');
    var sleep = require('system-sleep');
    var fs = require('fs');
    var jsesc = require('jsesc');
    const replaceURLAndUnderscore = require('./helper/replaceURLAndUnderscore');
    const url = "http://dbpedia.org/page/Category:Classical_musicians_by_nationality";

    const outputFile = "./scrapedoutput/dbpedia/dbpedia_Classical_musicians_by_nationality.json";
    console.log("---dbpedia_Classical_musicians_by_nationality.js started!---")
    var musicians = [];

//Delete outputfile if it already exists
    fs.unlink(outputFile, scrapeMainCat);

    function scrapeMainCat() {
        //request http://dbpedia.org/page/Category:Classical_musicians_by_nationality
        request(url, function (error, response, body) {
            if (error) {
                console.log("dbpedia_Classical_musicians_by_nationality.js scrapeMainCat: " + error);
                return
            }
            var $ = cheerio.load(body);
            // iterate through all of the nation_classical_composers, i.e. german_classical_composers, american_classical_composers, ...
            iterateSubCat($);
        })
    }

    function iterateSubCat($, callback) {
        var catArray = [];
        $('a[rev="skos:broader"]').each(function () {
            catArray.push($(this).attr('href'));
        });

        catArray.forEach(function (link) {
            sleep(1000);
            checkCat(link);

        });
        jsonEntry = JSON.stringify(musicians);
        fs.writeFileSync(outputFile, jsonEntry, 'utf8');
        returnToMaster();

    }

    function checkCat(linkNationality) {
        // go to the link of nation_classical_composers
        request(linkNationality, function (error, response, body) {
            if (error) {
                console.log("dbpedia_Classical_musicians_by_nationality.js checkCat: " + error);
                return
            }

            var $ = cheerio.load(body);
            //iterate through all of the musicians, i.e. Mozart, Brahms, ...
            $('a[rev="dct:subject"]').each(function (index) {
                sleep(1000);
                var linkMusician = $(this).attr('href');
                // go to the link of the musician
                checkArtist(linkMusician, linkNationality);
            });

        })
    }

    function checkArtist(linkMusician, linkNationality) {
        console.log("dbpedia_Classical_musicians_by_nationality.js scraping artist");
        request(jsesc(linkMusician), function (error, response, body) {
            if (error) {
                console.log("dbpedia_Classical_musicians_by_nationality.js checkArtist: " + error);
                return
            }

            var $ = cheerio.load(body);
            //extract infos
            var name = replaceURLAndUnderscore(linkMusician).split("(");

            var nationality = linkNationality.replace("http://dbpedia.org/page/Category:", "").replace("http://dbpedia.org/resource/Category:", "").replace("_classical_musicians", "");
            if (nationality.length == 0)
                nationality = null;

            var scrapedbpediaProperties = require('./helper/scrapedbpediaProperties.js');

            var scrapedData = scrapedbpediaProperties($);

            musicians.push({
                name: name[0].trim(),
                artist_type: 'musician',
                nationality: nationality,
                source_link: linkMusician,
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
        })
    }
};
