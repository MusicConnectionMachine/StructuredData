This script will scrape musicians from the URL "http://dbpedia.org/page/Category:Classical_musicians_by_nationality".

It will save the data in the output-file "dbpedia_Classical_musicians_by_nationality.json". The structure of the json file is the following:
{"name": String,
"nationality": String,
"dateOfBirth": Date(yyyy-dd-mm),
"dateOfDeath": Date(yyyy-dd-mm),
"placeOfBirth": String,
"placeOfDeath":String,
"instrument": String[],
"psuedonym":String[],
"work":String[],
"release":String[],
"tag":String[],
"link": String}
