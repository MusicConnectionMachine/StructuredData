const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const sleep = require('system-sleep');
const strSplit = require('strsplit');
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
//Eg: December 16, 1770 in Bonn, Germany so we extract Bonn,Germany from text.
function getPlace(placeInString) {
    var reqPlace;
    var values = []
    var dataOfBirth = placeInString.split(",").map(function(val) {
        values.push(val);
    });
    //values[0] = December 16 ,values[1] = 1770 in Bonn , values[2] = Germany
    if (values[1]) {
        var place = [];
        strSplit(values[1].trim(), /\s+/).map(function(element) {
            place.push(element);
        });
        if (place[2]) {
            if (values[2]) {
                reqPlace = place[2] + " " + values[2];
            } else {
                reqPlace = place[2];
            }
        }
    }
    return reqPlace;
}

function extractYear(value) {
    if (value) {
        var year = [];
        strSplit(value.trim(), /\s+/).map(function(element) {
            year.push(element);
        });
    }
    return year[0];
}

//dateInString-For Eg:December 16, 1770 in Bonn, Germany
function getDate(dateInString) {
    var date = [];
    var values = [];
    //split by ','
    var dataOfBirth = dateInString.split(",").map(function(val) {
        values.push(val);
    });
    month = []
    //Eg:values[0] = December 16
    if (values[0]) {
        var dateOfBirth;
        strSplit(values[0].trim(), /\s+/).map(function(ele) {
            month.push(ele);
        });
        //Eg:month[0] = December
        var monthNum = getMonth(month[0]);
        //Eg:if values[1] = 1770 in Bonn
        if (values[1]) {
            year = extractYear(values[1]);
            date.push(month[1]);
            date.push(monthNum);
            date.push(year);
        } else {
            date = null; //all parts of the date or nothing
        }
    } else {
        date = null; //all parts of the date or nothing
    }
    //Eg:date[0]=16 , date[1]=12 , date[3] = 1770
    return date;
}

function getMonth(monthName) {
    var monthNumber;
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
    return monthNumber;
}

function getResults(queryURL, callback) {
    var name = 'done';
    request(jsesc(queryURL), function(error, response, html) {
        var birthDate = "";
        if (error) {
            console.log("Error: " + error);
        }
        if (html) {
            var $ = cheerio.load(html);
            if (html) {
                var isClassicalComposer = false;
                //frist check if the person is a classical composer
                $('div.birth>div').each(function(i, element) {
                    var birth = $(this).text().trim();
                    var dob = [];
                    dob = getDate(birth);
                    //check if the date of birth of composer falls in the classical music period
                    //range maps to the date of birth of 17th & 18th cent classical composers in DBPedia
                    if (dob != null) {
                        if (parseInt(dob[2]) < parseInt(1820) && parseInt(dob[2]) > parseInt(1600)) {
                            birthDate = dob[0] + "-" + dob[1] + "-" + dob[2];
                            isClassicalComposer = true;
                        } else {
                            isClassicalComposer = false;
                            callback(name);
                            return;
                        }
                    }
                });

                if (isClassicalComposer) {
                    var name;
                    $('div.artist-bio-container>hgroup>h1.artist-name').each(function(i, element) {
                        name = $(this).text().trim();
                    });
                    var nationality = ""; //this information is not present in the source
                    var birthPlace = " ";
                    var birth = $(this).text().trim();
                    birthPlace = getPlace(birth);

                    var deathPlace = " ";
                    var deathDate = " ";
                    $('div.death>div').each(function(i, element) {
                        var death = $(this).text().trim();
                        if (death) {
                            var dod = [];
                            dod = getDate(death);
                            deathDate = dod[0] + "-" + dod[1] + "-" + dod[2];
                            deathPlace = getPlace(death);
                        } else {
                            deathPlace = " ";
                            deathDate = " ";
                        }
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
                    var tags = null; //no instruments are found in this source
                    var instrument = null; //no instruments are found in this source
                    var releases = null; //no instruments are found in this source

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
