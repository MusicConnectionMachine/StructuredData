var fs = require('fs');
var xhr = require('node-xhr');
var ceil = require('math-ceil');
var numeral = require('numeral');
var page = 1,
    total_links = 1000000,
    j = 1,
    total_records, i = 0,
    n = 10,
    arrayList;
var recording = [],
    artist = [],
    publisher = [],
    source_link = [];
var url = "https://www.worldcat.org/search?q=dt%3Asco&fq=&dblist=638&qt=page_number_link&start=" + page;
console.log(url);
console.log('request started!');
var obj = {
    table: []
};
var refreshIntervalId = setInterval(fname, 2000);

function fname() {
    xhr.post({
        url: url,
        headers: {
            'Content-Type': 'application/json',
        },
        params: {
            // ...
        },
        body: {
            // ...
        },
    }, function(err, res) {
        if (err) {
            console.log(err.message);
            return;
        }
        //console.log(JSON.stringify(res.status));
        //console.log(JSON.stringify(res.headers));
        //console.log(res.body);
        var cheerio = require('cheerio'),
            $ = cheerio.load(res.body);

        // Finds total records
        if (page == 1) {
            console.log('rashmi');
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
            //console.log($(this).text());   // music name
            var temp = ($(this).text()).replace(/[\n\r]+/g, '');
            temp = temp.replace(/\s{2,10}/g, '');
            recording.push(temp);
            source_link.push(url);
        });
        $('td .author').each(function() {
            //	 console.log($(this).text()); //musician
            var temp = ($(this).text()).replace(/[\n\r]+/g, '');
            temp = temp.replace(/\s{2,10}/g, '');
            artist.push($(this).text());
        });
        $('td .itemPublisher').each(function() {
            //console.log($(this).text()); //publisher
            var temp = ($(this).text()).replace(/[\n\r]+/g, '');
            temp = temp.replace(/\s{2,10}/g, '');
            publisher.push($(this).text());
        });
        k = 0;
        while (k < 10) {
            obj.table.push({
                recording_number: page + k,
                recording: recording[k],
                artist: artist[k],
                publisher: publisher[k],
                source: source_link[k]
            });
            k = k + 1;
        }

        page = page + 10;
        j = j + 1;
        if (j > total_links) {
            json2 = JSON.stringify(obj); //convert it back to json
            fs.writeFile('worldcat.json', json2, 'utf8'); // write it back
            clearInterval(refreshIntervalId);
        }
        url = "https://www.worldcat.org/search?q=dt%3Asco&fq=&dblist=638&qt=page_number_link&start=" + page;
        console.log(url);
    });
}
