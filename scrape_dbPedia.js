const http = require('http');
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var sleep = require('system-sleep');
var async = require('async');
const cmp = require('comparejs');


const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

  server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);

  var elemNum = 0;

  var newObj = {
    table: []
  };
  fs.readFile('myjsonfile2.json', 'utf-8', function(err, array) {
    if (err) throw err
    newObj.table.push({name:"Shilpa Gore",country : "IN",dob : "13-1-1689",works : " "});
    var json = JSON.stringify(newObj);
    fs.writeFile('myjsonfile2.json', json, 'utf8');
  });

  function getResults(queryURL,callback) {

	  var name = 'done'

	  request(queryURL,function(error , response , html){
								if(html){
									var $ = cheerio.load(html);

									if(html != null){
                    name = $('span[property="dbp:name"]').text();
                    if(!name){
                         var name = ($('h1 a').text()).split("(");
                    }
                    console.log(name);
                    newObj.table.push({name :name});

                    var array = [];
										$('a[rev="dbo:writer"]').each(function(i, element){
											var a = $(this);
											var label = a.attr('href');
											console.log(label);
                      array.push(label);
                    });

										$('a[rev="dbp:writer"]').each(function(i, element){
											var a = $(this);
											var label = a.attr('href');
											console.log(label);
											array.push(label);
                    });

                    newObj.table.push({works :array});
                    fs.readFile('myjsonfile2.json', 'utf-8', function(err, array) {
                      if (err) throw err
                        console.log(queryURL);
                        fs.writeFile('myjsonfile2.json',JSON.stringify(newObj),
                            'utf-8', function(err) {
                              if (err) throw err
                              console.log('Done!')
                        })
                      })
									}
                }
						});
						return callback(name);
  }

  url = 'http://dbpedia.org/page/Category:18th-century_classical_composers';
  request(url, function(error, response, html){
        if(!error){
				      var $ = cheerio.load(html);
				          $('a[rev="dct:subject"]').each(function(i, element){
                    var a = $(this);
								    var queryURL = a.attr('href');
							      sleep(300);
								    getResults(queryURL,function(name){
								});
          });

			}

		});
})
