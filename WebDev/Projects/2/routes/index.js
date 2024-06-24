const express = require('express');
const router = express.Router();
const db = require('../db/contactDB');

router.get('/', (req, res) => {
  db.all('SELECT * FROM Contacts', [], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.render('index', { contacts: rows, user: req.session.user });
  });
});

module.exports = router;
