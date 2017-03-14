////// THIS SCRIPT LOADS THE INPUT JSON FILE INTO ENTITIES TABLE.THIS TABLE IS EXPOSED TO GROUP 2 THORUGH REST API'S //////////////////////////
var fs = require("fs");
var pg = require("pg");
var content = fs.readFileSync("dbpedia_composer.json"); //296
var jsonContent = JSON.parse(content);
var cn = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '1234',
};

i=0;
console.log(jsonContent.length);
pg.connect(cn, function(err, client, done) {       
	if (err) {
           console.log(err);
        }
	while(i<jsonContent.length){
		var work=[],release=[],pseudonym=[];
		client.query('INSERT INTO "entities"'
				+ ' (name,pseudonym,work,release,source_link)'
				+ ' VALUES'
				+ ' ($1,$2,$3,$4,$5)'
				,[jsonContent[i].name,jsonContent[i].pseudonym,jsonContent[i].work,jsonContent[i].release,jsonContent[i].source_link]
				,function(err,res){
					if(err){ 		
						console.log(err);				
					}
				}
			);
		i=i+1;
		if(i>=jsonContent.length){
			done();
		}
	}
});
