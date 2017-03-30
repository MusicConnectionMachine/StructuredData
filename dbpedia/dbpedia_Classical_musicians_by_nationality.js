var request = require('request');
var cheerio = require('cheerio');
var sleep = require('system-sleep');
var fs = require('fs');
var jsesc = require('jsesc');
const url = "http://dbpedia.org/page/Category:Classical_musicians_by_nationality";

const outputFile = "./scrapedoutput/artists/dbpedia_Classical_musicians_by_nationality.json";

var musicians = [];
//helper functions to replace al occurrences of a string
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}
function replaceURLAndUnderscore(str) {
    str = str.replace("http://dbpedia.org/resource/", "")
    return replaceAll(str, "_", " ")
}
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
        }
    )
}

function iterateSubCat($, callback) {
    var catArray = [];
    $('a[rev="skos:broader"]').each(function () {
        catArray.push($(this).attr('href'));
    });

    catArray.forEach(function (link) {
            checkCat(link);
            sleep(1000);
        }
    );
    console.log("----Write to output file!----");
    jsonEntry = JSON.stringify(musicians);
    fs.writeFileSync(outputFile, jsonEntry, 'utf8');
    process.send("done scraping dbpedia_Classical_musicians_by_nationality");
    process.exit();

}

function checkCat(linkNationality) {
    console.log("checking nationality :" + linkNationality);
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
                console.log("checking musician :" + linkMusician);
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

                        var dateOfBirth = $('span[property="dbo:birthDate"]').text().trim();
                        var dateOfDeath = $('span[property="dbo:deathDate"]').text().trim();

                        //birthplace
                        var placeOfBirth = "";
                        if ($('span[property="dbp:birthPlace"]').text().trim() && $('span[property="dbp:birthPlace"]').text().trim() != "") {
                            placeOfBirth = $('span[property="dbp:birthPlace"]').text().trim();
                        }
                        else if ($('span[property="dbp:placeOfBirth"]').text().trim() && $('span[property="dbp:placeOfBirth"]').text().trim() != "") {
                            placeOfBirth = $('span[property="dbp:placeOfBirth"]').text().trim();
                        }
                        else if ($('a[rel="dbo:placeOfBirth"]').attr('href') && $('a[rel="dbo:placeOfBirth"]').attr('href') != "") {
                            placeOfBirth = replaceURLAndUnderscore($('a[rel="dbo:placeOfBirth"]').attr('href'));
                        }
                        else if ($('a[rel="dbo:birthPlace"]').attr('href') && $('a[rel="dbo:birthPlace"]').attr('href') != "") {
                            placeOfBirth = replaceURLAndUnderscore($('a[rel="dbo:birthPlace"]').attr('href'));
                        }

                        //placeOfDeath
                        var placeOfDeath = "";
                        if ($('span[property="dbp:placeOfDeath"]').text().trim() && $('span[property="dbp:placeOfDeath"]').text().trim() != "") {
                            placeOfDeath = $('span[property="dbp:placeOfDeath"]').text().trim();
                        }
                        else if ($('span[property="dbp:deathPlace"]').text().trim() && $('span[property="dbp:deathPlace"]').text().trim() != "") {
                            placeOfDeath = $('span[property="dbp:deathPlace"]').text().trim();
                        }
                        else if ($('a[rel="dbo:placeOfDeath"]').attr('href') && $('a[rel="dbo:placeOfDeath"]').attr('href') != "") {
                            placeOfDeath = replaceURLAndUnderscore($('a[rel="dbo:placeOfDeath"]').attr('href'));
                        }
                        else if ($('a[rel="dbo:deathPlace"]').attr('href') && $('a[rel="dbo:deathPlace"]').attr('href') != "") {
                            placeOfDeath = replaceURLAndUnderscore($('a[rel="dbo:deathPlace"]').attr('href'));
                        }

                        //instrument
                        var instrument = [];
                        if ($('span[property="dbp:instrument"]').text().trim() && $('span[property="dbp:instrument"]').text().trim() != "") {
                            $('span[property="dbp:instrument"]').each(function (index) {
                                instrument.push($(this).text().trim());
                            });
                        }
                        else if ($('a[rel="dbo:instrument"]').attr('href') && $('a[rel="dbo:instrument"]').attr('href') != "") {
                            $('a[rel="dbo:instrument"]').each(function (index) {
                                var inst = replaceURLAndUnderscore($(this).attr('href'));
                                instrument.push(inst);
                            });
                        }


                        //pseudonym
                        var psuedonym = [];
                        if ($('span[property="dbp:psuedonym"]').text() && $('span[property="dbp:psuedonym"]').text() != "") {
                            $('span[property="dbp:psuedonym"]').each(function (index) {
                                var psuedo = replaceURLAndUnderscore($(this).text());
                                psuedonym.push(psuedo);
                            });
                        }

                        // work
                        var work = [];
                        if ($('span[property="dbp:writer"]').text().trim() && $('span[property="dbp:writer"]').text().trim() != "") {
                            $('span[property="dbp:writer"]').each(function (index) {
                                instrument.push($(this).text().trim());
                            });
                        }
                        else if ($('a[rel="dbo:writer"]').attr('href') && $('a[rel="dbo:writer"]').attr('href') != "") {
                            $('a[rel="dbo:writer"]').each(function (index) {
                                var inst = replaceURLAndUnderscore($(this).attr('href'));
                                instrument.push(inst);
                            });
                        }

                        //release
                        var release = [];
                        if ($('a[rel="dbp:artist"]').attr('href') && $('a[rel="dbp:artist"]').attr('href') != "") {
                            $('a[rel="dbp:artist"]').each(function (index) {
                                var rel = replaceURLAndUnderscore($(this).attr('href'));
                                release.push(rel);
                            });
                        }

                        var tag = [];
                        if ($('a[rel="dct:subject"]').attr('href') && $('a[rel="dct:subject"]').attr('href') != "") {
                            $('a[rel="dct:subject"]').each(function (index) {
                                if ($(this).attr('href').includes("classic")) {
                                    var t = replaceURLAndUnderscore($(this).attr('href').replace("Category:", ""));
                                    tag.push(t);
                                }

                            });
                        }
                        var wiki_link = "";
                        if ($('a[rel="foaf:isPrimaryTopicOf"]').attr('href')) {
                            wiki_link = $('a[rel="foaf:isPrimaryTopicOf"]').attr('href');
                        }
                        else if ($('a[rel="foaf:primaryTopic"]').attr('href')) {
                            wiki_link = $('a[rel="foaf:primaryTopic"]').attr('href');

                        }

                        var wiki_pageid = "";
                        if ($('span[property="dbo:wikiPageID"]').text()) {
                            wiki_pageid = $('span[property="dbo:wikiPageID"]').text();
                        }

                        if (nationality.length == 0)
                            nationality = null;
                        if (dateOfBirth.length == 0)
                            dateOfBirth = null;
                        if (dateOfDeath.length == 0)
                            dateOfDeath = null;
                        if (placeOfBirth.length == 0)
                            placeOfBirth = null;
                        if (placeOfDeath.length == 0)
                            placeOfDeath = null;
                        if (instrument.length == 0)
                            instrument = null;
                        if (psuedonym.length == 0)
                            psuedonym = null;
                        if (work.length == 0)
                            work = null;
                        if (release.length == 0)
                            release = null;
                        if (tag.length == 0)
                            tag = null;
                        if (wiki_link.length == 0)
                            wiki_link = null;
                        if (wiki_pageid.length == 0)
                            wiki_pageid = null;

                        console.log("adding " + name);
                        musicians.push({
                            name: name,
                            nationality: nationality,
                            dateOfBirth: dateOfBirth,
                            dateOfDeath: dateOfDeath,

                            placeOfBirth: placeOfBirth,

                            placeOfDeath: placeOfDeath,
                            instrument: instrument,
                            psuedonym: psuedonym,
                            work: work,

                            release: release,
                            tag: tag,
                            source_link: linkMusician,
                            wikipedia_link: wiki_link,
                            wikipedia_pageid: wiki_pageid
                        })

                    }
                })
            });
        }
    })
}
