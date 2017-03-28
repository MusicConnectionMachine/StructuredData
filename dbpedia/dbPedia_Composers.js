const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const sleep = require('system-sleep');
var jsesc = require('jsesc');

var newObj = [];
var url = [],
    link = [];
url.push('http://dbpedia.org/page/Category:17th-century_classical_composers');
url.push('http://dbpedia.org/page/Category:18th-century_classical_composers');

//helper functions to replace all occurrences of a string
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function replaceURLAndUnderscore(str) {
    str = str.replace("http://dbpedia.org/resource/", "")
    return replaceAll(str, "_", " ")
}

function getResults(queryURL, callback) {
    name = "done";
    request(jsesc(queryURL), function(error, response, html) {
        console.log(queryURL);
        if (!html) {
            return;
        }
        var $ = cheerio.load(html);
        if (html != null) {
            //name
            name = $('span[property="dbp:name"]').text();
            if (!name) {
                var name = (replaceURLAndUnderscore(queryURL)).split("(");
                name = name[0].trim();
            }
            var nationality = $('span[property="dbo:nationality"]').text().trim();
            var dateOfBirth = $('span[property="dbo:birthDate"]').text().trim();
            var dateOfDeath = $('span[property="dbo:deathDate"]').text().trim();

            //birthplace
            var placeOfBirth;
            if ($('span[property="dbp:birthPlace"]').text().trim() && $('span[property="dbp:birthPlace"]').text().trim() != "") {
                placeOfBirth = $('span[property="dbp:birthPlace"]').text().trim();
            } else if ($('span[property="dbp:placeOfBirth"]').text().trim() && $('span[property="dbp:placeOfBirth"]').text().trim() != "") {
                placeOfBirth = $('span[property="dbp:placeOfBirth"]').text().trim();
            } else if ($('a[rel="dbo:placeOfBirth"]').attr('href') && $('a[rel="dbo:placeOfBirth"]').attr('href') != "") {
                placeOfBirth = replaceURLAndUnderscore($('a[rel="dbo:placeOfBirth"]').attr('href'));
            } else if ($('a[rel="dbo:birthPlace"]').attr('href') && $('a[rel="dbo:birthPlace"]').attr('href') != "") {
                placeOfBirth = replaceURLAndUnderscore($('a[rel="dbo:birthPlace"]').attr('href'));
            } else {
                placeOfBirth = "";
            }

            //placeOfDeath
            var placeOfDeath;
            if ($('span[property="dbp:placeOfDeath"]').text().trim() && $('span[property="dbp:placeOfDeath"]').text().trim() != "") {
                placeOfDeath = $('span[property="dbp:placeOfDeath"]').text().trim();
            } else if ($('span[property="dbp:deathPlace"]').text().trim() && $('span[property="dbp:deathPlace"]').text().trim() != "") {
                placeOfDeath = $('span[property="dbp:deathPlace"]').text().trim();
            } else if ($('a[rel="dbo:placeOfDeath"]').attr('href') && $('a[rel="dbo:placeOfDeath"]').attr('href') != "") {
                placeOfDeath = replaceURLAndUnderscore($('a[rel="dbo:placeOfDeath"]').attr('href'));
            } else if ($('a[rel="dbo:deathPlace"]').attr('href') && $('a[rel="dbo:deathPlace"]').attr('href') != "") {
                placeOfDeath = replaceURLAndUnderscore($('a[rel="dbo:deathPlace"]').attr('href'));
            } else {
                placeOfDeath = "";
            }

            //psuedonym
            var psuedonym = [];
            if ($('span[property="dbp:psuedonym"]').text() && $('span[property="dbp:psuedonym"]').text() != "") {
                $('span[property="dbp:psuedonym"]').each(function(index) {
                    var psuedo = replaceURLAndUnderscore($(this).text());
                    if (psuedo != "")
                        psuedonym.push(psuedo);
                });
            }

            //works
            var array = [];
            $('a[rev="dbo:writer"]').each(function(i, element) {
                var a = $(this);
                var label = a.text();
                label.split("dbr:").map(function(val) {
                    array.push(val);
                });
            });

            $('a[rev="dbp:writer"]').each(function(i, element) {
                var a = $(this);
                var label = a.text();
                label.split("dbr:").map(function(val) {
                    array.push(val);
                });
            });

            //instrument
            var instrument = [];
            if ($('span[property="dbp:instrument"]').text().trim() && $('span[property="dbp:instrument"]').text().trim() != "") {
                $('span[property="dbp:instrument"]').each(function(index) {
                    instrument.push($(this).text().trim());
                });
            } else if ($('a[rel="dbo:instrument"]').attr('href') && $('a[rel="dbo:instrument"]').attr('href') != "") {
                $('a[rel="dbo:instrument"]').each(function(index) {
                    var inst = replaceURLAndUnderscore($(this).attr('href'));
                    instrument.push(inst);
                });
            }

            //release
            var release = [];
            if ($('a[rel="dbp:artist"]').attr('href') && $('a[rel="dbp:artist"]').attr('href') != "") {
                $('a[rel="dbp:artist"]').each(function(index) {
                    var rel = replaceURLAndUnderscore($(this).attr('href'));
                    release.push(rel);
                });
            }

            if ($('a[rel="dbo:artist"]').attr('href') && $('a[rel="dbo:artist"]').attr('href') != "") {
                $('a[rel="dbo:artist"]').each(function(index) {
                    var rel = replaceURLAndUnderscore($(this).attr('href'));
                    release.push(rel);
                });
            }

            //tag
            var tag = [];
            substring = "classic";
            if ($('a[rel="dct:subject"]').text()) {
                $('a[rel="dct:subject"]').each(function(index) {
                    var rel = replaceURLAndUnderscore($(this).text());
                    if (rel.includes(substring)) {
                        tag.push(rel.substr(4, rel.length));
                    }
                });
            }
            // wiki link
            var  wiki_link = "";
            if ($('a[rel="foaf:isPrimaryTopicOf"]').attr('href'))
                wiki_link = $('a[rel="foaf:isPrimaryTopicOf"]').attr('href');
            else if ($('a[rel="foaf:primaryTopic"]').attr('href'))
                wiki_link = $('a[rel="foaf:primaryTopic"]').attr('href');

            // wiki page id
            var wiki_pageid = "";
            if ($('span[property="dbo:wikiPageID"]').text()) {
                wiki_pageid = $('span[property="dbo:wikiPageID"]').text();
            }

            if (array.length == 0)
                array = null;
            if (release.length == 0)
                release = null;
            if (psuedonym.length == 0)
                psuedonym = null;
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
            if (tag.length == 0)
                tag = null;
            if (wiki_link.length == 0)
                wiki_link = null;
            if (wiki_pageid.length == 0)
                wiki_pageid = null;
            newObj.push({
                name: name,
                nationality: nationality,
                dateOfBirth: dateOfBirth,
                dateOfDeath: dateOfDeath,
                placeOfBirth: placeOfBirth,
                placeOfDeath: placeOfDeath,
                instrument: instrument,
                psuedonym: psuedonym,
                work: array,
                release: release,
                tag: tag,
                source_link: queryURL,
                wikipedia_link: wiki_link,
                wikipedia_pageid: wiki_pageid
            });
        }
    });
    return callback(name);
}

function get_URL(value, callback) {
    request(jsesc(value), function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('a[rev="dct:subject"]').each(function(i, element) {
                var a = $(this);
                var queryURL = a.attr('href');
                link.push(queryURL);
            });
            link.forEach(function(value) {
                getResults(value, function(name) {});
                sleep(1000);
            });
            fs.writeFileSync('dbPedia_Composers.json', JSON.stringify(newObj), 'utf-8')
            process.exit();
        }
    });
}
url.forEach(function(value) {
    get_URL(value);
});
