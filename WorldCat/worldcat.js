module.exports = function (returnToMaster) {

    var fs = require('fs');
    var request = require('request');
    var ceil = require('math-ceil');
    var floor = require('math-floor');
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
        author = [];
    var url = "https://www.worldcat.org/search?q=dt%3Asco&fq=yr%3A1800&dblist=638&qt=page_number_link&start=" + page;
    console.log(url);
    var refreshIntervalId = setInterval(fname, 2000);

    function fname() {
        request(url, function (error, response, body) {
            $ = cheerio.load(body);
            // Finds total records
            if (page == 1) {
                total_records = $('.resultsinfo strong').text();
                $('.resultsinfo strong').each(function () {
                    if (i == 1) {
                        total_records = $(this).text();
                    }
                    i = i + 1;
                });
                console.log("total records: " + total_records);
                total_links = ceil((numeral(total_records)).value() / 10);
                console.log("total links: " + total_links);
            }

            $('td .name').each(function () {
                recording.push(replaceTabNewLine($(this).text()));
            });
            $('td .author').each(function () {
                author.push(replaceTabNewLine($(this).text()));
            });
            source_link.push(url);
            page = page + 10;
            j = j + 1;
            if (j > total_links) {
                k = 0;
                while (k < total_records) {
                    var release = [],
                        title = [];
                    title = recording;
                    artist = author[k].split(";");
                    artist[0] = artist[0].substr(3, artist[0].length);
                    for (var index = 0; index < artist.length; index++) {
                        artist[index] = artist[index].trim();
                        if (artist[index] == "")
                            artist = artist.splice(index, 1);
                    }
                    musicians.push({
                        title: title[k],
                        artist: artist,
                        source_link: source_link[floor(k / 10)]
                    });
                    k = k + 1;
                }
                var json2 = JSON.stringify(musicians); //convert it back to json
                fs.writeFileSync('./scrapedoutput/releases/worldcat.json', json2, 'utf8'); // write it back
                clearInterval(refreshIntervalId);
                returnToMaster();
            }
            url = "https://www.worldcat.org/search?q=dt%3Asco&fq=yr%3A1800&dblist=638&qt=page_number_link&start=" + page;
        });
    }

    function replaceTabNewLine(str) {
        str = str.replace(/[\n\r]+/g, '');
        str = str.replace(/\s{2,10}/g, '');
        return str;
    }
}
