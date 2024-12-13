const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('./config.cjs');
const svgrid = require('./models/svgrid.cjs');
const { console } = require('inspector');

//console.log(process.env.SECRET_KEY);

// Mock User Data
const users = [{ id: 1, username: 'Admin', password: bcrypt.hashSync('Admin', 8) }];


const app = express();
app.use(cors());

const spath = path.join(__dirname, '../dist');
app.use(express.static(spath))

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.json({Error: "access denied"}); //sendStatus(403)
      }
      req.user = user;
      next();
    });
  } else {
    return res.json({Error: "access denied"});  //sendStatus(401)
  }
};

app.all('/grid', authenticateJWT, async (req, res, next) => {
  let params = (req.method == "GET") ? req.query : req.body;
  const grid = await svgrid.createGrid(params)
    .catch(
      (err) => { 
      Error: err.toString() 
    })
  res.json(grid);
});

app.post('/exec', async function (req, res, next) {
  let params = req.body;
  const result = await svgrid.exec(params)
    .catch((err) => { return { message: err.toString() } })
  res.json(result);
});


const port = 1793;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});