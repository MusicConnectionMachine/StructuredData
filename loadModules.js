let fs = require('fs');
let path = require('path');

module.exports = (context, callback) => {
    var counter = 0;
    fs.readdir(path.join(__dirname, "api", "api", "models"), (err, files) => {
        files.forEach(file => {
            counter++;
            context.component('models').module(file.replace('.js', ''));
            if (counter == files.length) {
                callback();
            }
        });
    });

};
