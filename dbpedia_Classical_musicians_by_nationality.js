var request = require('request');
var cheerio = require('cheerio');
var sleep = require('system-sleep');
var fs = require('fs');
var url = "http://dbpedia.org/page/Category:Classical_musicians_by_nationality";


var outputFile = "dbpedia_Classical_musicians_by_nationality.json";

//helper functions to replace al occurrences of a string
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}
function replaceURLAndUnderscore(str) {
    str = str.replace("http://dbpedia.org/resource/", "")
    return replaceAll(str, "_", " ")
}
//Delete outputfile if it already exists
fs.unlink(outputFile, function () {
    //request http://dbpedia.org/page/Category:Classical_musicians_by_nationality
    request(url, function (error, response, body) {
        if (error) {
            console.log("Error: " + error);
        }

        var $ = cheerio.load(body);
        // iterate through all of the nation_classical_composers, i.e. german_classical_composers, american_classical_composers, ...
        $('a[rev="skos:broader"]').each(function (index) {
            sleep(1500);

            var linkNationality = $(this).attr('href');
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
                        sleep(1500);
                        var linkMusician = $(this).attr('href');
                        console.log("checking musician :" + linkMusician);
                        // go to the link of the musician
                        request(linkMusician, function (error, response, body) {
                            if (error) {
                                console.log("Error: " + error);
                            }
                            if (body) {
                                var $ = cheerio.load(body);
                                //extract infos
                                var name = $('h1#title > a').text().replace(/\(.*\)/g, '').trim();

                                var nationality = linkNationality.replace("http://dbpedia.org/page/Category:", "").replace("http://dbpedia.org/resource/Category:", "").replace("_classical_musicians", "");

                                var music = [];
                                if ($('a[rev="dbp:music"]').attr('href') && $('a[rev="dbp:music"]').attr('href') != "") {
                                    $('a[rev="dbp:music"]').each(function (index) {
                                        var mus = replaceURLAndUnderscore($(this).attr('href'));
                                        music.push(mus);
                                    })
                                }

                                var dateOfBirth = $('span[property="dbo:birthDate"]').text().trim();
                                var dateOfDeath = $('span[property="dbo:deathDate"]').text().trim();

                                //handle multiple fields of placeOfBirth
                                var placeOfBirth;
                                if ($('span[property="dbp:birthPlace"]').text().trim() && $('span[property="dbp:birthPlace"]').text().trim() != "") {
                                    placeOfBirth = $('span[property="dbp:birthPlace"]').text().trim();
                                }
                                else if ($('span[property="dbp:birthPlace"]').text().trim() && $('span[property="dbp:birthPlace"]').text().trim() != "") {
                                    placeOfBirth = $('span[property="dbp:placeOfBirth"]').text().trim();
                                }
                                else if ($('a[rel="dbo:placeOfBirth"]').attr('href') && $('a[rel="dbo:placeOfBirth"]').attr('href') != "") {
                                    placeOfBirth = replaceURLAndUnderscore($('a[rel="dbo:placeOfBirth"]').attr('href'));
                                }
                                else if ($('a[rel="dbo:birthPlace"]').attr('href') && $('a[rel="dbo:birthPlace"]').attr('href') != "") {
                                    placeOfBirth = replaceURLAndUnderscore($('a[rel="dbo:birthPlace"]').attr('href'));
                                }
                                else {
                                    placeOfBirth = "";
                                }

                                //handle multiple fields of placeOfDeath
                                var placeOfDeath;
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
                                else {
                                    placeOfDeath = "";
                                }

                                //handle multiple fields of instrument
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

                                //associatedBand
                                var associatedBand = [];
                                if ($('a[rel="dbo:associatedBand"]').attr('href') && $('a[rel="dbo:associatedBand"]').attr('href') != "") {
                                    $('a[rel="dbo:associatedBand"]').each(function (index) {
                                        var assoBand = replaceURLAndUnderscore($(this).attr('href'));
                                        associatedBand.push(assoBand);
                                    });
                                }

                                //release
                                var release = [];
                                if ($('a[rel="dbp:artist"]').attr('href') && ('a[rel="dbp:artist"]').attr('href') != "") {
                                    $('a[rel="dbp:artist"]').each(function (index) {
                                        var rel = replaceURLAndUnderscore($(this).attr('href'));
                                        release.push(rel);
                                    });
                                }

                                jsonEntry = JSON.stringify({
                                    name: name,
                                    nationality: nationality,
                                    music: music,
                                    dateOfBirth: dateOfBirth,
                                    dateOfDeath: dateOfDeath,
                                    placeOfBirth: placeOfBirth,
                                    placeOfDeath: placeOfDeath,
                                    instrument: instrument,
                                    associatedBand: associatedBand,
                                    release: release,
                                    link: linkMusician
                                });
                                console.log("adding " + name);
                                fs.appendFileSync(outputFile, jsonEntry + ',');
                            }
                        })
                    })
                }
            })
        })
    })
});