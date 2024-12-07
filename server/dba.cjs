const sql = require("msnodesqlv8");
const util = require('util');
const dbquery = util.promisify(sql.query);
exports.dbquery = dbquery;
