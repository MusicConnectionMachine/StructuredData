module.exports = function ($) {
    var replaceURLAndUnderscore = require('./replaceURLAndUnderscore');

    //to check if only one date is considered
    //Eg:http://dbpedia.org/page/David_Breeden has two date of death entries
    var dateOfBirth;
    var dbobirthDate = $('span[property="dbo:birthDate"]');
    if (dbobirthDate.text().trim()) {
        dbobirthDate.each(function (index) {
            dateOfBirth = $(this).text().trim();
        });
    }

    var dateOfDeath;
    var dbodeathDate = $('span[property="dbo:deathDate"]');
    if (dbodeathDate.text().trim()) {
        dbodeathDate.each(function (index) {
            dateOfDeath = $(this).text().trim();
        });
    }
    //birthplace
    var placeOfBirth;
    var dbpplaceOfBirth = $('span[property="dbp:placeOfBirth"]');
    var dbpbirthPlace = $('span[property="dbp:birthPlace"]');
    var dboplaceOfBirth = $('a[rel="dbo:placeOfBirth"]');
    var dbobirthPlace = $('a[rel="dbo:birthPlace"]');

    if (dbpplaceOfBirth.text().trim()) {
        placeOfBirth = dbpplaceOfBirth.text().trim();
    } else if (dbpbirthPlace.text().trim()) {
        placeOfBirth = dbpbirthPlace.text().trim();
    } else if (dboplaceOfBirth.attr('href')) {
        placeOfBirth = replaceURLAndUnderscore(dboplaceOfBirth.attr('href'));
    } else if (dbobirthPlace.attr('href')) {
        placeOfBirth = replaceURLAndUnderscore(dbobirthPlace.attr('href'));
    }

    //placeOfDeath
    var placeOfDeath;
    var dbpplaceOfDeath = $('span[property="dbp:placeOfDeath"]');
    var dbpdeathPlace = $('span[property="dbp:deathPlace"]');
    var dboplaceOfDeath = $('a[rel="dbo:placeOfDeath"]');
    var dbodeathPlace = $('a[rel="dbo:deathPlace"]');

    if (dbpplaceOfDeath.text().trim()) {
        placeOfDeath = dbpplaceOfDeath.text().trim();
    } else if (dbpdeathPlace.text().trim()) {
        placeOfDeath = dbpdeathPlace.text().trim();
    } else if (dboplaceOfDeath.attr('href')) {
        placeOfDeath = replaceURLAndUnderscore(dboplaceOfDeath.attr('href'));
    } else if (dbodeathPlace.attr('href')) {
        placeOfDeath = replaceURLAndUnderscore(dbodeathPlace.attr('href'));
    }

    //instrument
    var instrument = [];
    var dbpinstrument = $('span[property="dbp:instrument"]');
    var dboinstrument = $('a[rel="dbo:instrument"]');
    if (dbpinstrument.text().trim()) {
        dbpinstrument.each(function (index) {
            instrument.push($(this).text().trim());
        });
    } else if (dboinstrument.attr('href')) {
        dboinstrument.each(function (index) {
            var inst = replaceURLAndUnderscore($(this).attr('href'));
            instrument.push(inst);
        });
    }

    //psuedonym
    var pseudonym = [];
    var dbppsuedonym = $('span[property="dbp:psuedonym"]');
    if (dbppsuedonym.text()) {
        dbppsuedonym.each(function (index) {
            var psuedo = replaceURLAndUnderscore($(this).text());
            pseudonym.push(psuedo);
        });
    }

    //work
    var work = [];
    var dbowriter = $('a[rev="dbo:writer"]');
    var dbpwriter = $('a[rev="dbp:writer"]');
    if (dbowriter.text().trim()) {
        dbowriter.each(function (index) {
            var rel = replaceURLAndUnderscore($(this).text().trim());
            work.push(rel);
        });
    }
    if (dbpwriter.text().trim()) {
        dbpwriter.each(function (index) {
            var rel = replaceURLAndUnderscore($(this).text().trim());
            work.push(rel);
        });
    }

    //release
    var release = [];
    var dbpartist = $('a[rel="dbp:artist"]');
    var dboartist = $('a[rel="dbo:artist"]');

    if (dbpartist.attr('href')) {
        dbpartist.each(function (index) {
            var rel = replaceURLAndUnderscore($(this).attr('href'));
            release.push(rel);
        });
    }
    if (dboartist.attr('href')) {
        dboartist.each(function (index) {
            var rel = replaceURLAndUnderscore($(this).attr('href'));
            release.push(rel);
        });
    }

    //tag
    var tags = [];
    var dctsubject = $('a[rel="dct:subject"]');
    substring = "classic";
    if (dctsubject.text().trim()) {
        dctsubject.each(function (index) {
            var rel = replaceURLAndUnderscore($(this).text().trim());
            if (rel.includes(substring)) {
                tags.push(rel.substr(4, rel.length));
            }
        });
    }
    // wiki link
    var wiki_link;
    var foafisPrimaryTopicOf = $('a[rel="foaf:isPrimaryTopicOf"]');
    var foafprimaryTopic = $('a[rel="foaf:primaryTopic"]');
    if (foafisPrimaryTopicOf.attr('href'))
        wiki_link = foafisPrimaryTopicOf.attr('href');
    else if (foafprimaryTopic.attr('href'))
        wiki_link = foafprimaryTopic.attr('href');

    // wiki page id
    var wiki_pageid;
    var dbowikiPageID = $('span[property="dbo:wikiPageID"]');
    if (dbowikiPageID.text().trim()) {
        wiki_pageid = dbowikiPageID.text().trim();
    }

    return {
        dateOfBirth: dateOfBirth,
        dateOfDeath: dateOfDeath,
        placeOfBirth: placeOfBirth,
        placeOfDeath: placeOfDeath,
        instrument: instrument,
        pseudonym: pseudonym,
        work: work,
        release: release,
        tags: tags,
        wiki_link: wiki_link,
        wiki_pageid: wiki_pageid
    }
}
