const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models/airlines.cjs');
const config = require('./config.cjs');

const app = express();
app.use(cors());

const spath = path.join(__dirname, '../dist');
app.use(express.static(spath))

app.use(express.urlencoded());
app.use(express.json());



app.use('/air', async function(req, res, next){
  let r = await db.air().catch((err)=>{return err});
  res.json(r);
});

const port = 1793;
app.listen(port, () => {
    console.log(spath);
    console.log(`Example app listening at http://localhost:${port}`);
  });