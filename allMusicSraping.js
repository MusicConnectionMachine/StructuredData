const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const sleep = require('system-sleep');
const strSplit = rdateTimeequire('strsplit');
var jsesc = require('jsesc');
var newObj = [];

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function replaceURLAndUnderscore(str) {
    str = str.replace("http://www.allmusic.com/composition/", "")
    return replaceAll(str, "_", " ")
}
//Extracted information  is in the form
//Eg: December 16, 1770 in Bonn, Germany so we extract tokens from text.
function getPlace(birthPlaceInString, callback) {
    var birthPlace;
    var values = []
    var dataOfBirth = birthPlaceInString.split(",").map(function(val) {
        values.push(val);
    });
    if (values[1]) {
        var year = [];
        strSplit(values[1].trim(), /\s+/).map(function(element) {
            year.push(element);
        });
        if (year[2]) {
            if (year[3]) {
                birthPlace = year[2] + year[3];
            } else {
                birthPlace = year[2];
            }
        }
    }
    return callback(birthPlace);
}

function getDate(dateInString, callback) {
    var date = [];
    var values = [];
    var dataOfBirth = dateInString.split(",").map(function(val) {
        values.push(val);
    });
    month = []
    if (values[0]) {
        var dateOfBirth;
        strSplit(values[0].trim(), /\s+/).map(function(ele) {
            month.push(ele);
        });
        getMonth(month[0], function(monthNumber) {
            var dayNum;
            monName = monthNumber;
            if (monName) {
                dateOfBirth = month[1] + "-" + monName;
                date.push(month[1]);
                date.push(monName);
            } else {}

            if (values[1]) {
                var year = [];
                strSplit(values[1].trim(), /\s+/).map(function(element) {
                    year.push(element);
                });
                date.push(year[0]);
            }
        });
    }
    return date;
}

function getMonth(monthName, callback) {
    var monthNumber;
    //console.log(monthName);
    switch (monthName) {
        case 'January':
            monthNumber = '01';
            break;
        case 'February':
            monthNumber = '02';
            break;
        case 'March':
            monthNumber = '03';
            break;
        case 'April':
            monthNumber = '04';
            break;
        case 'May':
            monthNumber = '05';
            break;
        case 'June':
            monthNumber = '06';
            break;
        case 'July':
            monthNumber = '07';
            break;
        case 'August':
            monthNumber = '08';
            break;
        case 'September':
            monthNumber = '09';
            break;
        case 'October':
            monthNumber = '10';
            break;
        case 'November':
            monthNumber = '11';
            break;
        case 'December':
            monthNumber = '12';
            break;
        default:
            monthNumber = '0'
    }
    return callback(monthNumber);
}

function getResults(queryURL, callback) {
    var name = 'done';
    request(jsesc(queryURL), function(error, response, html) {
        console.log("queryUrl", queryURL);
        var birthDate;
        if (error) {
            console.log("Error: " + error);
        }
        if (html) {
            var $ = cheerio.load(html);
            console.log("url", queryURL);
            if (html) {
                var isClassicalComposer = false;
                //frist check if the person is a classical composer
                $('div.birth>div').each(function(i, element) {
                    var birth = $(this).text().trim();
                    console.log("birth", birth);
                    var dob = [];
                    dob = getDate(birth);
                    if (parseInt(dob[2]) < parseInt(1820) && parseInt(dob[2]) > parseInt(1600)) {
                        birthDate = dob[0] + "-" + dob[1] + "-" + dob[2];
                        isClassicalComposer = true;
                    } else {
                        isClassicalComposer = false;
                        callback(name);
                        return;
                    }
                });

                if (isClassicalComposer) {
                    var name;
                    $('div.artist-bio-container>hgroup>h1.artist-name').each(function(i, element) {
                        name = $(this).text().trim();
                    });
                    var nationality = ""; //this information is not present in the source
                    var birthPlace;
                    var birth = $(this).text().trim();
                    getPlace(birth, function(err, birthPlace) {

                        if (err) {
                            birthPlace = birthPlace;
                        } else {
                            birthPlace = "";
                        }
                    });

                    var deathPlace;
                    var deathDate;
                    $('div.death>div').each(function(i, element) {
                        var death = $(this).text().trim();
                        var dod = [];
                        dod = getDate(death);
                        if (parseInt(dod[2]) < parseInt(1820) && parseInt(dod[2]) > parseInt(1600)) {
                            birthDate = dod[0] + "-" + dod[1] + "-" + dod[2];
                            isClassicalComposer = true;
                        } else {
                            isClassicalComposer = false;
                            callback(name);
                            return;
                        }

                        getPlace(death, function(err, deathPlace) {
                            if (err) {
                                deathPlace = "";
                            } else {
                                deathPlacedeathPlace = deathPlace;

                            }
                        });
                    });

                    var pseudonym = [];
                    $('div.aliases>div>div').each(function() {
                        var psueName = replaceURLAndUnderscore($(this).text());
                        pseudonym.push(psueName);
                    });
                    //works
                    var title = [];
                    $('td.title>a').each(function(i, element) {
                        var workTitle = replaceURLAndUnderscore($(this).attr('href'));
                        title.push(workTitle);
                    });
                    var tags = [];
                    //instrument
                    var instrument = []; //no instruments are found in this source
                    var releases = [];
                    newObj.push({
                        name: name,
                        nationality: nationality,
                        dateOfBirth: birthDate,
                        dateOfDeath: deathDate,
                        placeOfBirth: birthPlace,
                        placeOfDeath: deathPlace,
                        instrument: instrument,
                        psuedonym: pseudonym,
                        work: title,
                        release: releases,
                        tag: tags,
                        source_link: queryURL
                    });
                    fs.writeFileSync('allmusicComposers.json', JSON.stringify(newObj), 'utf-8');
                }
            }
        }

    });
    return callback(name);
}

url = 'http://www.allmusic.com/genre/classical-ma0000002521/artists';
request(url, function(error, response, html) {

    if (error) {
        console.log("have an error " + error);
    }
    if (!error) {
        var $ = cheerio.load(html);
        if (html) {
            $('div.artist-highlight>a').each(function(i, element) {
                var link = "http://allmusic.com" + $(this).attr('href');
                getResults(link, function(name) {});
                sleep(1000);
            });

        }
    }

    process.exit();
});
