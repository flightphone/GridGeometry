const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
require('./config.cjs');
const svgrid = require('./models/svgrid.cjs');
const auth = require('./models/auth.cjs')
const fc = require('./models/fc.cjs')
const { console } = require('inspector');

const app = express();
app.use(cors());

const port = process.env.PORT || 1793;

const spath = path.join(__dirname, '../dist');
app.use(express.static(spath))

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/login', async (req, res) => {
  const user = await auth.auth(req.body);
  if (!user.error) {
    const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '90d' });
    res.json({ token });
  } else {
    res.status(401).json({ message: user.error });
  }
});



app.all('/grid', auth.authenticateJWT, async (req, res, next) => {
  let params = (req.method == "GET") ? req.query : req.body;
  params.Account = req.user.username;
  const grid = await svgrid.createGrid(params)
    .catch((err) => { return { Error: err.toString() } })
  res.json(grid);
});


app.post('/gettree', auth.authenticateJWT, async (req, res) => {
  const menu = await svgrid.gettree(req.user.username)
    .catch((err) => { return { Error: err.toString() } })
  res.json(menu);
});

app.post('/exec', auth.authenticateJWT, async function (req, res, next) {
  let params = req.body;
  const result = await svgrid.exec(params, req.user.username)
    .catch((err) => { return { Error: err.toString() } });
  res.json(result);
});


app.post('/savefc', auth.authenticateJWT, async function (req, res) {
  let params = req.body;
  const result = await fc.save(params, req.user.username)
    .catch((err) => { return { Error: err.toString() } });
  res.json(result);
});

var usmRouter = require('./usm/usm.cjs');
app.use('/usm', usmRouter);


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}/#81`);
});
