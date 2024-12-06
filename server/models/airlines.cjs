const sql = require("msnodesqlv8");
const util = require('util');
const config = require('../config.cjs');
const query = "SELECT * FROM Airlines";

const mquery = util.promisify(sql.query);
const air = async () => {
    const connectionString = config.connectionString;
    return await mquery(connectionString, query);
}

exports.air = air;