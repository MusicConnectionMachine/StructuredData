module.exports = function (returnToMaster) {

    var fs = require('fs');
    var request = require('request');
    var ceil = require('math-ceil');
    var floor = require('math-floor');
    var numeral = require('numeral');
    var cheerio = require('cheerio');
    var page = 1,
        linkCounter = 1,
        total_links, total_records;
    let firstIteration = false;
    var musicians = [];
    var url = "https://www.worldcat.org/search?q=dt%3Asco&fq=yr%3A1800&dblist=638&qt=page_number_link&start=" + page;
    console.log(url);
    var refreshIntervalId = setInterval(fname, 200);

    function fname() {

        console.log("Worldcat pushing " + url);
        request(url, function (error, response, body) {
                if (error) {
                    console.log("Error while requesting worldcat: " + error)
                    return
                }
                $ = cheerio.load(body);
                // Finds total records
                if (!firstIteration) {
                    let resultsinfoCounter = 0;
                    $('.resultsinfo strong').each(function () {
                        if (resultsinfoCounter == 1) {
                            total_records = $(this).text();
                        }
                        resultsinfoCounter ++;
                    });
                    console.log("total records: " + total_records);
                    total_links = ceil((numeral(total_records)).value() / 10);
                    console.log("total links: " + total_links);
                    firstIteration = true;
                }


                $('td [class="result details"]').each(function () {
                    let title = $(this).find('.name>a>strong').text();

                    let artist = $(this).find('.author').text().replace("by", "").replace(";", "").trim();

                    let source_link = "https://www.worldcat.org/" + $(this).find('.name>a').attr('href');

                    musicians.push({
                        title: title,
                        artist: artist,
                        source_link: source_link
                    });

                });

                linkCounter++;

                if (linkCounter > total_links) {
                    clearInterval(refreshIntervalId);
                    var output = JSON.stringify(musicians); //convert it back to json
                    fs.writeFileSync('./scrapedoutput/worldcat/worldcat.json', output, 'utf8'); // write it back
                    returnToMaster();
                }
            }
        );
        page = page + 10;
        url = "https://www.worldcat.org/search?q=dt%3Asco&fq=yr%3A1800&dblist=638&qt=page_number_link&start=" + page;


    }

}
