const fs = require('fs');
const path = require('path');
var config = {
    connectionString: "",
    Account: "",
    sqlConfig : {
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        server: process.env.SERVER,
        requestTimeout: 45000,
        options: {
            "encrypt": false, 
            "tdsVersion": "7_3_B"
        }
    }
}
module.exports = config;