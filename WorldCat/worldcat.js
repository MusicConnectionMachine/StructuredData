var fs = require('fs');
var request = require('request');
var ceil = require('math-ceil');
var numeral = require('numeral');
var cheerio = require('cheerio');
var page = 1,
    total_links = 1000000,
    j = 1,
    total_records, i = 0,
    n = 10,
    arrayList;
var source_link = [],
    musicians = [],
    recording = [],
    artist = [];
var url = "https://www.worldcat.org/search?q=dt%3Asco&fq=&dblist=638&qt=page_number_link&start=" + page;
console.log(url);
var refreshIntervalId = setInterval(fname, 2000);

function fname() {
    request(url, function(error, response, body) {
            $ = cheerio.load(body);
            // Finds total records
            if (page == 1) {
                total_records = $('.resultsinfo strong').text();
                $('.resultsinfo strong').each(function() {
                    if (i == 1) {
                        total_records = $(this).text();
                    }
                    i = i + 1;
                });
                console.log(total_records);
                total_links = ceil((numeral(total_records)).value() / 10);
                console.log(total_links);
            }

            $('td .name').each(function() {
                recording.push(replaceTabNewLine($(this).text()));
            });
            $('td .author').each(function() {
                artist.push(replaceTabNewLine($(this).text()));
            });

            page = page + 10;
            j = j + 1;
            if (j > total_links) {
            k = 0;
            while (k < 10) {
                var release = [],
                    name = [];
                name = recording;
                release = artist[k].split(";");
                release[0] = release[0].substr(3, release[0].length);
                console.log(name[k]);
                console.log(release);
                for (var index = 0; index < release.length; index++) {
                    release[index] = release[index].trim();
                    if (release[index] == "")
                        release = release.splice(index, 1);
                }
                console.log(release);
                musicians.push({
                    release: release,
                    name: name[k],
                    source_link: source_link
                });
                k = k + 1;
            }
            var json2 = JSON.stringify(musicians); //convert it back to json
            fs.writeFileSync('worldcat.json', json2, 'utf8'); // write it back
            clearInterval(refreshIntervalId);
            process.exit();
        }
        url = "https://www.worldcat.org/search?q=dt%3Asco&fq=&dblist=638&qt=page_number_link&start=" + page; console.log(url);
    });
}

function replaceTabNewLine(str) {
    str = str.replace(/[\n\r]+/g, '');
    str = str.replace(/\s{2,10}/g, '');
    return str;
}
