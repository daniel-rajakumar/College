const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');



router.get('/', async (req, res) => {
  const user = await req.db.findUserByUsername("cmps369");

  if ( !user ){
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync("rcnj", salt);

    await req.db.createUser("road", "runner", "cmps369", hash)
  }

  return res.render('index', { contacts: await req.db.readAllContacts() });
});

module.exports = router;



