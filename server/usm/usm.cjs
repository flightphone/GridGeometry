var express = require('express');
var router = express.Router();
const config = require('../config.cjs');
const mssql = require('mssql')
const auth = require('../models/auth.cjs')
const fs = require('node:fs/promises');
const AdmZip = require('adm-zip');
const ods_ex = require('../models/ods_export.cjs')

/* GET users listing. */
router.get('/newsid', auth.authenticateJWT, async function (req, res, next) {
  const grid = await newsid(req.user.username)
    .catch((err) => { return { Error: err.toString() } })
  res.json(grid);
});

router.post('/print', auth.authenticateJWT, async function (req, res, next) {
  const params = req.body;
  try {
    let file = await print(params)
    res.send(file)
  }
  catch (ex) {
    res.status(501).json({ Error: ex.message });
  }
});


async function print(params) {
  let sl = params.SaveFieldList.split(",");
  const EditProc = sl[0];
  const srcname = `./reports/${sl[1]}.ods`;
  const field_name = sl[2]
  if (!(EditProc && srcname && field_name))
    throw new Error('Printer params empty');
  const SQLParams = params.SQLParams;

  const sqlConfig = config.sqlConfig;
  const pool = new mssql.ConnectionPool(sqlConfig);
  await pool.connect();
  const request = new mssql.Request(pool);
  const pars = [];
  for (const fname in SQLParams) {
    pars.push(`@${fname} = @${fname}`);
    let val = SQLParams[fname];
    if (val == '')
      val = null;
    request.input(fname, val);
  }
  const strval = pars.join(", ")
  const sql = `set dateformat ymd; execute ${EditProc} ${strval}`;
  const result = await request.query(sql);

  const df_head = result.recordsets[0];
  const df_detail = result.recordsets[1];

  const zip = new AdmZip(srcname);
  let sxml = zip.readAsText("content.xml");

  sxml = ods_ex.setTemplate(sxml, df_head, df_detail, field_name)
  zip.updateFile("content.xml", sxml)
  res = zip.toBuffer();
  return res;
}


async function newsid(Account) {
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