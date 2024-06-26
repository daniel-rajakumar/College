const express = require('express');
const router = express.Router();
// const Database = require('dbcmps369');
const db = require('../db/contactDB');
const ContactDB = require('../db/contactDB');



router.get('/', async (req, res) => {
  // const user = req.db.findUserByUsername("cmps369");

  // if ( !user ){
  //   console.log("user")
  //   const salt = bcrypt.genSaltSync(10)
  //   const hash = bcrypt.hashSync(password, salt);

  //   const id = await req.db.createUser("cmps369", hash)
  //   req.session.user = await req.db.findUserById(id);
  //   res.redirect('/')
  // }

  // console.log(req.db.readAllContacts())


  // req.db.all('SELECT * FROM Contacts', [], (err, rows) => {
  //   if (err) {
  //     return res.status(500).send(err.message);
  //   }
  //   res.render('index', { contacts: rows, user: req.session.user });
  // });

  return res.render('index', { contacts: await req.db.readAllContacts() });
});


router.post('/', async (req, res) => { 
  const userId = req.session.user ? req.session.user.id : -1

  })

module.exports = router;



