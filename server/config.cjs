const fs = require('fs');
const path = require('path');
var config = {connectionString:"-"};
const fname = path.join(__dirname, '../server_config.json');
fs.readFile(fname, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    try {
        conf = JSON.parse(data);
        for (pro in conf)
        {
            config[pro] = conf[pro];
        }
        //console.dir(config);
    }
    catch (e) {
        console.error(e);
    }
});
module.exports = config;