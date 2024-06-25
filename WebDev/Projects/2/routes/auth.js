const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db/contactDB');

router.get('/login', (req, res) => {
  res.render('login', { hide_login: true });
});

router.post('/login', (req, res) => {
  res.render('login', { hide_login: true , message: "Did not do this yet..." });

  const { email, password } = req.body;

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
  res.render('signup', { hide_login: true });
});

router.post('/signup', (req, res) => {
  // res.render('signup', { hide_login: true , message: "Did not do this yet..." });

  const { first, last, username, password, password2 } = req.body;

  if (password !== password2) {
    return res.render('signup', { hide_login: true, message: 'Passwords do not match' });
  }


  const user = db.findUserByUsername(username);


  // if (user) {
  //   return res.render('signup', { hide_login: true, message: "User already exists" });
  // }

  const salt = bcrypt.genSaltSync(10)
  // console.log(salt);








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




const findUserByUsername = async (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM Users WHERE Username = ?', [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};