const express = require('express');
const router = express.Router();
// const Database = require('dbcmps369');
const db = require('../db/contactDB');
const ContactDB = require('../db/contactDB');
const bcrypt = require('bcryptjs');



router.get('/', async (req, res) => {
  const user = await req.db.findUserByUsername("cmps369");

  if ( !user ){
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync("rcnj", salt);

    const id = await req.db.createUser("road", "runner", "cmps369", hash)
    // req.session.user = await req.db.findUserById(id);
  }

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



