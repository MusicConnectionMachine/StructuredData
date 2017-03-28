These scripts will scrape artists from the URL "http://dbpedia.org/".

The following lists are iterated:
"http://dbpedia.org/page/Category:21st-century_classical_musicians"
"http://dbpedia.org/page/Category:20th-century_classical_musicians"
"http://dbpedia.org/page/Category:19th-century_classical_musicians"
"http://dbpedia.org/page/Category:18th-century_classical_musicians"
"http://dbpedia.org/page/Category:17th-century_classical_musicians"
"http://dbpedia.org/page/Category:Classical_musicians_by_instrument"
"http://dbpedia.org/page/Category:Classical_musicians_by_instrument_and_nationality"
"http://dbpedia.org/page/Category:Classical_musicians_by_nationality"
"http://dbpedia.org/page/Category:17th-century_classical_composers"
"http://dbpedia.org/page/Category:18th-century_classical_composers"

It will save the data in the respective output-files. The structure of the json file is the following:
{
    name: String,
    nationality: String,
    dateOfBirth: Date(yyyy-dd-mm),
    dateOfDeath: Date(yyyy-dd-mm),
    placeOfBirth: String,
    placeOfDeath:String,
    instrument: String[],
    psuedonym:String[],
    work:String[],
    release:String[],
    tag:String[],
    source_link: String,
    wikipedia_link: String,
    wikipedia_pageid: String
}
