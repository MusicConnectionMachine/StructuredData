var request = require('request');
var name = [{"name": "blah"}];
request({	
	url: 'http://127.0.0.1:3000/entities',
	qs: {from: 'example', time: +new Date()},
	method: 'GET',
	json: { "name": 'blah'}
	}, function(error, response, body){
	console.log(body);
	if(error){
		console.log(error);
	} 
});
