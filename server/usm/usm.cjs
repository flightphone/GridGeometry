var express = require('express');
var router = express.Router();
const config = require('../config.cjs');
const mssql = require('mssql')
const auth = require('../models/auth.cjs')

/* GET users listing. */
router.get('/newsid', auth.authenticateJWT, async function(req, res, next) {
    const grid = await newsid(req.user.username)
    .catch((err) => {return { Error: err.toString() }})
  res.json(grid);
});

async function newsid(Account)
{
    const sqlConfig = config.sqlConfig;
    const pool = new mssql.ConnectionPool(sqlConfig);
    await pool.connect();
    let sql = 'exec p_cntnewsession @Account = @Account'
    const request = new mssql.Request(pool);
    request.input("Account", Account);
    const result = await request.query(sql);
    return result.recordset[0];
}
module.exports = router;