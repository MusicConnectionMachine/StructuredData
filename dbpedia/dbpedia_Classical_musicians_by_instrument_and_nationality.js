/////////////////////EXTRACTS ALL CLASSICAL MUSICIANS BY INSTRUMENTS AND NATIONALITY///////////////
var fs = require('fs');
var sleep = require('system-sleep');
var request = require("request");
var cheerio = require('cheerio');
var jsesc = require('jsesc');

var musicians = [],
    temp_list = [],
    temp_list1 = [],
    temp_list2 = [],
    temp_list3 = [],
    source_link = [],
    source_sub_link = [];
var url = [],
    k = 1;

//helper functions to replace al occurrences of a string
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function replaceURLAndUnderscore(str) {
    str = str.replace("http://dbpedia.org/resource/", "")
    return replaceAll(str, "_", " ")
}

url.push("http://dbpedia.org/page/Category:Classical_musicians_by_instrument_and_nationality");
console.log(url);
console.log('request started!');

url.forEach(function(value) {
    fetch1(value);
});

function fetch1(link1) {
    request(link1, function(error, response, body) {
        if (body) {
            $ = cheerio.load(body);
            $('a[rev="skos:broader"]').each(function(i, element) {
                var a = $(this);
                temp_list.push(a.attr('href'));
            });
            temp_list1 = temp_list;
            temp_list = [];

            temp_list1.forEach(function(value) {
                fetch2(value);
                sleep(2000);

            });
            temp_list2 = temp_list;
            temp_list = [];

            temp_list2.forEach(function(value) {
                fetch2(value);
                sleep(1000);
            });

            temp_list3 = temp_list;
            temp_list = [];

            temp_list3.forEach(function(value) {
                fetch3(value);
                sleep(1000);
            });

            source_link.forEach(function(value) {
                fetch4(value);
                sleep(1000);
            });
            jsonOutput = JSON.stringify(musicians); //convert it back to json
            fs.writeFileSync("dbpedia_Classical_musicians_by_instruments_and_nationality.json", jsonOutput, 'utf8'); // write it back
            console.log("write end");
            process.exit();
        }
    });
}


function fetch2(value2) {
    console.log(value2);
    request(value2, function(error, response, body) {
        if (body) {
            $ = cheerio.load(body);
            $('a[rev="skos:broader"]').each(function(i, element) {
                var a = $(this);
                temp_list.push(a.attr('href'));
            });
        }
    });
}

function fetch3(linkNationality) {
    console.log(linkNationality);
    request(linkNationality, function(error, response, body) {
        if (body) {
            $ = cheerio.load(body);
            $('a[rev="dct:subject"]').each(function(i, element) {
                var a = $(this);
                var nationality = linkNationality.replace("http://dbpedia.org/page/Category:", "").replace("http://dbpedia.org/resource/Category:", "");
                nationality = nationality.slice(0, nationality.indexOf("classical")).replace(new RegExp("_", 'g'), "").replace("fortepianist", "");
                source_link.push({
                    linkMusician: a.attr('href'),
                    nationality: nationality
                });
                console.log(nationality);
            });
            //    console.log(source_link.length);
        }
    });
}

function fetch4(linkMusicianAndNationality) {
    console.log(linkMusicianAndNationality);
    request(jsesc(linkMusicianAndNationality.linkMusician), function(error, response, body) {
        $ = cheerio.load(body);

        var split_name = (replaceURLAndUnderscore(linkMusicianAndNationality.linkMusician)).split("(");
        var nationality = linkMusicianAndNationality.nationality;
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

        //psuedonym
        var psuedonym = [];
        if ($('span[property="dbp:psuedonym"]').text() && $('span[property="dbp:psuedonym"]').text() != "") {
            $('span[property="dbp:psuedonym"]').each(function(index) {
                var psuedo = replaceURLAndUnderscore($(this).text());
                psuedonym.push(psuedo);
            });
        }

        //work
        var work = [];
        if ($('a[rev="dbo:writer"]').text() && $('a[rev="dbo:writer"]').text() != "") {
            $('a[rev="dbo:writer"]').each(function(index) {
                var rel = replaceURLAndUnderscore($(this).text());
                work.push(rel);
            });
        }

        if ($('a[rev="dbp:writer"]').text() && $('a[rev="dbp:writer"]').text() != "") {
            $('a[rev="dbp:writer"]').each(function(index) {
                var rel = replaceURLAndUnderscore($(this).text());
                work.push(rel);
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

        if (work.length == 0)
            work = null;
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
        musicians.push({
            name: split_name[0].trim(),
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
            source_link: linkMusicianAndNationality,
            wikipedia_link: wiki_link,
            wikipedia_pageid: wiki_pageid
        });
    });
}
