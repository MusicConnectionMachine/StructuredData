var request = require('request');
var cheerio = require('cheerio');
var sleep = require('system-sleep');
var fs = require('fs');
var jsesc = require('jsesc');
const replaceURLAndUnderscore = require('./helper/replaceURLAndUnderscore');
const url = "http://dbpedia.org/page/Category:Classical_musicians_by_nationality";

const outputFile = "./scrapedoutput/artists/dbpedia_Classical_musicians_by_nationality.json";
console.log("---dbpedia_Classical_musicians_by_nationality.js started!---")
var musicians = [];

//Delete outputfile if it already exists
fs.unlink(outputFile, scrapeMainCat);

function scrapeMainCat() {
    //request http://dbpedia.org/page/Category:Classical_musicians_by_nationality
    request(url, function (error, response, body) {
        if (error) {
            console.log("Error: " + error);
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
    console.log("----Write to output file!----");
    jsonEntry = JSON.stringify(musicians);
    fs.writeFileSync(outputFile, jsonEntry, 'utf8');
    process.send("done dbpedia_Classical_musicians_by_nationality.js");

}

function checkCat(linkNationality) {
    // go to the link of nation_classical_composers
    request(linkNationality, function (error, response, body) {
        if (error) {
            console.log("Error: " + error);
        }

        if (body) {
            var $ = cheerio.load(body);
            //iterate through all of the musicians, i.e. Mozart, Brahms, ...
            $('a[rev="dct:subject"]').each(function (index) {

                sleep(1000);
                var linkMusician = $(this).attr('href');
                // go to the link of the musician
                request(jsesc(linkMusician), function (error, response, body) {
                    if (error) {
                        console.log("Error: " + error);
                    }
                    if (body) {
                        var $ = cheerio.load(body);
                        //extract infos
                        var name = replaceURLAndUnderscore(linkMusician);

                        var nationality = linkNationality.replace("http://dbpedia.org/page/Category:", "").replace("http://dbpedia.org/resource/Category:", "").replace("_classical_musicians", "");
                        if (nationality.length == 0)
                            nationality = null;

                        var scrapedbpediaProperties = require('./helper/scrapedbpediaProperties.js');

                        var scrapedData = scrapedbpediaProperties($);

                        musicians.push({
                            name: name,
                            artist_type: 'musician',
                            nationality: nationality,
                            source_link: linkMusician,
                            scrapedData
                        })

                    }
                })
            });
        }
    })
}
