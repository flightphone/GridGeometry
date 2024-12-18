const config = require('../config.cjs');
const mssql = require('mssql')

async function save(fc, Account) {
    //console.log(fc);
    return { message: "OK" };
}

exports.save = save;