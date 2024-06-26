const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db/contactDB');
const base = require('../app');
const ContactDB = require('../db/contactDB');

router.get('/login', (req, res) => {
  res.render('login', { hide_login: true });
});

router.post('/login', async (req, res) => {

  const { username, password } = req.body;

  console.log(req.body)

  const user = await req.db.findUserByUsername(username);
  

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = user;
    return res.redirect('/');
  } else {
    return res.render('login', { hide_login: true , message: "Could not authenticate" });
  }
});









router.get('/signup', (req, res) => {
  res.render('signup', { hide_login: true });
});

router.post('/signup', async (req, res) => {
  const { first, last, username, password, password2 } = req.body;

  if (password !== password2) {
    return res.render('signup', { hide_login: true, message: 'Passwords do not match' });
  }

  const user = await req.db.findUserByUsername(username);

  if (user) {
    return res.render('signup', { hide_login: true, message: "User already exists" });
  }

  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password, salt);


  const id = await req.db.createUser(first, last, username, hash)
  req.session.user = await req.db.findUserById(id);

  res.redirect('/')
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;


