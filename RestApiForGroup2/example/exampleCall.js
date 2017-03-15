var request = require('request');
request({
    url: 'http://127.0.0.1:3000/entities',
    qs: {
        from: 'example',
        time: +new Date()
    },
    method: 'GET',
}, function(error, response, body) {
    if (error) {
        console.log(error);
    }
});

request({
    url: 'http://127.0.0.1:3000/entities',
    qs: {
        from: 'example',
        time: +new Date()
    },
    method: 'GET',
}, function(error, response, body) {
    if (error) {
        console.log(error);
    }
    console.log(response);
});
request({
    url: 'http://127.0.0.1:3000/entities/590',
    qs: {
        from: 'example',
        time: +new Date()
    },
    method: 'GET',
    json: {
        "enitity_id": "590"
    }
}, function(error, response, body) {
    console.log(body);
    if (error) {
        console.log(error);
    }
    console.log(response);
});
request({
    url: 'http://127.0.0.1:3000/entities',
    qs: {
        from: 'example',
        time: +new Date()
    },
    method: 'POST',
    json: {
        "name": "spaceHolder",
        "pseudonym": ["space", "Holder"],
        "work": ["music", "song"],
        "release": ["myalbum"],
        "srcLink": ["http://mymusic.com/space"]

    }
}, function(error, response, body) {

    if (error) {
        console.log(error);
    } else {
        console.log(response);
    }
});
request({
    url: 'http://127.0.0.1:3000/entities/590',
    qs: {
        from: 'example',
        time: +new Date()
    },
    method: 'PUT',
    json: {
        "name": "worldSpace",
        "pseudonym": ["world", "Space"],
        "work": ["music", "song"],
        "release": ["myresleases"],
        "srcLink": ["http://mymusic.com/world"]

    }
}, function(error, response, body) {
    if (error) {
        console.log(error);
    }
    console.log(response);
});
request({
    url: 'http://127.0.0.1:3000/entities/2',
    qs: {
        from: 'example',
        time: +new Date()
    },
    method: 'DELETE',
    json: {}
}, function(error, response, body) {
    if (error) {
        console.log(error);
    }
    console.log(response);
});
request({
    url: 'http://127.0.0.1:3000/entities',
    qs: {
        from: 'example',
        time: +new Date()
    },
    method: 'POST',
    json: {
        "name": "newRecord",
        "pseudonym": ["new", "Record"],
        "work": ["new music", "new song"],
        "release": ["newalbum"],
        "srcLink": ["http://mymusic.com/space"]

    }
}, function(error, response, body) {
    if (error) {
        console.log(error);
    }
    console.log(response);
});
