/////////////////////EXTRACTS 21st,20th,19th,18th and 17th Century classical musicians///////////////
var fs = require('fs');
var sleep = require('system-sleep');
var request = require("request");
var cheerio = require('cheerio');
var jsesc = require('jsesc');
var source_link = [],
    url = [],
    musicians = [];
url.push("http://dbpedia.org/page/Category:21st-century_classical_musicians");
url.push("http://dbpedia.org/page/Category:20th-century_classical_musicians");
url.push("http://dbpedia.org/page/Category:19th-century_classical_musicians");
url.push("http://dbpedia.org/page/Category:18th-century_classical_musicians");
url.push("http://dbpedia.org/page/Category:17th-century_classical_musicians");
console.log("---dbpedia_Classical_musicians_by_century.js started!---")


url.forEach(function (value) {
    fetch1(value);
});

//helper functions to replace all occurrences of a string
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function replaceURLAndUnderscore(str) {
    str = str.replace("http://dbpedia.org/resource/", "")
    return replaceAll(str, "_", " ")
}

function fetch1(link1) {
    request(link1, function (error, response, body) {
        if (body) {
            $ = cheerio.load(body);

            $('a[rev="dct:subject"]').each(function (i, element) {
                var a = $(this);
                source_link.push(a.attr('href'));
            });

            source_link.forEach(function (value) {
                fetch2(value);
                sleep(1000);

            });
            var json2 = JSON.stringify(musicians); //convert it back to json
            fs.writeFileSync('./scrapedoutput/artists/dbpedia_Classical_musicians_by_century.json', json2, 'utf8'); // write it back
            process.send("done dbpedia_Classical_musicians_by_century.js");
        }

    });
}


function fetch2(value2) {
    request(jsesc(value2), function (error, response, body) {
        if (body) {
            $ = cheerio.load(body);
            var split_name = (replaceURLAndUnderscore(value2)).split("(");
            var nationality = $('span[property="dbo:nationality"]').text().trim();
            //to check if only one date is considered
            //Eg:http://dbpedia.org/page/David_Breeden has two date of death entries
            var dateOfBirth = null;
            if ($('span[property="dbo:birthDate"]').text().trim()) {
                $('span[property="dbo:birthDate"]').each(function (index) {
                    dateOfBirth = $(this).text().trim();
                });
            }
            var dateOfDeath = null;
            if ($('span[property="dbo:deathDate"]').text().trim()) {
                $('span[property="dbo:deathDate"]').each(function (index) {
                    dateOfDeath = $(this).text().trim();
                });
            }
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

            //instrument
            var instrument = [];
            if ($('span[property="dbp:instrument"]').text().trim() && $('span[property="dbp:instrument"]').text().trim() != "") {
                $('span[property="dbp:instrument"]').each(function (index) {
                    instrument.push($(this).text().trim());
                });
            } else if ($('a[rel="dbo:instrument"]').attr('href') && $('a[rel="dbo:instrument"]').attr('href') != "") {
                $('a[rel="dbo:instrument"]').each(function (index) {
                    var inst = replaceURLAndUnderscore($(this).attr('href'));
                    instrument.push(inst);
                });
            }

            //psuedonym
            var pseudonym = [];
            if ($('span[property="dbp:psuedonym"]').text() && $('span[property="dbp:psuedonym"]').text() != "") {
                $('span[property="dbp:psuedonym"]').each(function (index) {
                    var psuedo = replaceURLAndUnderscore($(this).text());
                    pseudonym.push(psuedo);
                });
            }

            //work
            var work = [];
            if ($('a[rev="dbo:writer"]').text() && $('a[rev="dbo:writer"]').text() != "") {
                $('a[rev="dbo:writer"]').each(function (index) {
                    var rel = replaceURLAndUnderscore($(this).text());
                    work.push(rel);
                });
            }

            if ($('a[rev="dbp:writer"]').text() && $('a[rev="dbp:writer"]').text() != "") {
                $('a[rev="dbp:writer"]').each(function (index) {
                    var rel = replaceURLAndUnderscore($(this).text());
                    work.push(rel);
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

            if ($('a[rel="dbo:artist"]').attr('href') && $('a[rel="dbo:artist"]').attr('href') != "") {
                $('a[rel="dbo:artist"]').each(function (index) {
                    var rel = replaceURLAndUnderscore($(this).attr('href'));
                    release.push(rel);
                });
            }

            //tag
            var tags = [];
            substring = "classic";
            if ($('a[rel="dct:subject"]').text()) {
                $('a[rel="dct:subject"]').each(function (index) {
                    var rel = replaceURLAndUnderscore($(this).text());
                    if (rel.includes(substring)) {
                        tags.push(rel.substr(4, rel.length));
                    }
                });
            }
            // wiki link
            var wiki_link = "";
            if ($('a[rel="foaf:isPrimaryTopicOf"]').attr('href'))
                wiki_link = $('a[rel="foaf:isPrimaryTopicOf"]').attr('href');
            else if ($('a[rel="foaf:primaryTopic"]').attr('href'))
                wiki_link = $('a[rel="foaf:primaryTopic"]').attr('href');

            // wiki page id
            var wiki_pageid = "";
            if ($('span[property="dbo:wikiPageID"]').text()) {
                wiki_pageid = $('span[property="dbo:wikiPageID"]').text();
            }

            if (nationality.length == 0)
                nationality = null;
            if (placeOfBirth.length == 0)
                placeOfBirth = null;
            if (placeOfDeath.length == 0)
                placeOfDeath = null;
            if (wiki_link.length == 0)
                wiki_link = null;
            if (wiki_pageid.length == 0)
                wiki_pageid = null;
            //console.log("dbpedia_Classical_musicians_by_century.js adding entity");
            musicians.push({
                name: split_name[0].trim(),
                artist_type: 'musician',
                nationality: nationality,
                dateOfBirth: dateOfBirth,
                dateOfDeath: dateOfDeath,
                placeOfBirth: placeOfBirth,
                placeOfDeath: placeOfDeath,
                instrument: instrument,
                pseudonym: pseudonym,
                work: work,
                release: release,
                tags: tags,
                source_link: value2,
                wiki_link: wiki_link,
                wiki_pageid: wiki_pageid
            });
        }

    });
}
