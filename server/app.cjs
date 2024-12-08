const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models/airlines.cjs');
const config = require('./config.cjs');
const svgrid = require('./models/svgrid.cjs');

const app = express();
app.use(cors());

const spath = path.join(__dirname, '../dist');
app.use(express.static(spath))

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.all('/grid', async function(req, res, next){
  let params = (req.method == "GET") ? req.query : req.body;
  const grid = await svgrid.createGrid(params)
  .catch((err)=> {return {error:err}})
  res.json(grid);
});

app.all('/air', async function(req, res, next){
  let r = await db.air().catch((err)=>{return err});
  res.json(r);
});

const port = 1793;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });