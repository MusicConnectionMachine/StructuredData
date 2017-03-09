const http = require('http');
const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();
const sleep = require('system-sleep');
const async = require('async');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(function(request, response) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    response.end('Hello World\n');
});

server.listen(port, hostname, function() {
    console.log(`Server running at http://${hostname}:${port}/`);

    var elemNum = 0;

    var newObj = {
        table: []
    };
    fs.readFile('myjsonfile2.json', 'utf-8', function(err, array) {
        if (err) throw err
        newObj.table.push({
            name: "dummyname",
            birthDate: "13-1-1689",
            birthPlace: "dummyPlace",
            deathDate: "dummyDeathDate",
            deathPlace: "dummyDeathPlace ",
            Pseudonym: "dummyPseudonym ",
            works: "dummyWorks"
        });
        var json = JSON.stringify(newObj);
        fs.writeFile('myjsonfile2.json', json, 'utf8');
    });

    function getResults(queryURL, callback) {
        var name = 'done'
        request(queryURL, function(error, response, html) {
            if (html) {
                var $ = cheerio.load(html);
                if (html != null) {
                    //name
                    name = $('span[property="dbp:name"]').text();
                    if (!name) {
                        var name = ($('h1 a').text()).split("(");
                    }
                    newObj.table.push({
                        name: name
                    });
                    //date of birth
                    dateOfBirth = $('span[property="dbp:birthDate"]').text();
                    if (!dateOfBirth) {
                        dateOfBirth = "xxxx-xx-xx";
                    }
                    newObj.table.push({
                        birthDate: dateOfBirth
                    });
                    //birthPlace
                    birthPlace = $('span[property="dbp:birthPlace"]').text();
                    if (!birthPlace) {
                        var birthPlace = "not given";
                    }
                    newObj.table.push({
                        birthPlace: birthPlace
                    });
                    //dateOfDeath
                    dateOfDate = $('span[property="dbp:deathDate"]').text();
                    if (!dateOfDeath) {
                        var dateOfDeath = "xxxx-xx-xx";
                    }
                    newObj.table.push({
                        deathDate: dateOfDate
                    });
                    //place of death
                    deathPlace = $('span[property="dbp:birthPlace"]').text();
                    if (!deathPlace) {
                        var deathPlace = "not given";
                    }
                    newObj.table.push({
                        deathPlace: deathPlace
                    });
                    //pseudonym
                    pseudonym = $('span[property="dbp:psuedonym"]').text();
                    if (!pseudonym) {
                        var pseudonym = "not given";
                    }
                    newObj.table.push({
                        pseudonym: pseudonym
                    });
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

                    newObj.table.push({
                        works: array
                    });
                    fs.readFile('myjsonfile2.json', 'utf-8', function(err, array) {
                        if (err) throw err
                        fs.writeFile('dbPedia_17thCentComposers.json', JSON.stringify(newObj),
                            'utf-8',
                            function(err) {
                                if (err) throw err
                            })
                    })
                }
            }
        });
        return callback(name);
    }

    const url = 'http://dbpedia.org/page/Category:17th-century_classical_composers';
    request(url, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('a[rev="dct:subject"]').each(function(i, element) {
                var a = $(this);
                var queryURL = a.attr('href');
                sleep(300);
                getResults(queryURL, function(name) {});
            });

        }

    });
});
