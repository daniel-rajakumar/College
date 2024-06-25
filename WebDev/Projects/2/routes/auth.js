const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db/contactDB');

router.get('/login', (req, res) => {
  res.render('login', { hide_login: true });
});

router.post('/login', (req, res) => {
  res.render('login', {});

  // const { username, password } = req.body;
  // db.get('SELECT * FROM Users WHERE Username = ?', [username], (err, user) => {
  //   if (err || !user || !bcrypt.compareSync(password, user.Password)) {
  //     return res.render('login', { error: 'Invalid username or password' });
  //   }
  //   req.session.user = user;
    // res.redirect('/');
  // });
});









router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', (req, res) => {
  res.render('signup');
  // const { firstName, lastName, username, password, confirmPassword } = req.body;
  // if (password !== confirmPassword) {
  //   return res.render('signup', { error: 'Passwords do not match' });
  // }
  // const hashedPassword = bcrypt.hashSync(password, 10);
  // db.run('INSERT INTO Users (FirstName, LastName, Username, Password) VALUES (?, ?, ?, ?)', 
  //   [firstName, lastName, username, hashedPassword], (err) => {
  //   if (err) {
  //     return res.render('signup', { error: 'Username already exists' });
  //   }
  //   res.redirect('/login');
  // });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
