const express = require('express');
const router = express.Router();
const db = require('../db/contactDB');

router.get('/create', async (req, res) => {
  res.render('create');
});

router.post('/create', async (req, res) => {
  // res.render('create');
  const {
    first, last, phone, email, street, city, state, zip, country, contact_by_phone,
    contact_by_email, contact_by_mail
  } = req.body;

  if (!await req.db.findContactById(email)){
    await req.db.createContact(first, last, phone, email, street, city, state, zip, country, contact_by_phone, contact_by_email, contact_by_mail)
    return res.redirect('/');
  } else {
    return res.render('create', {message: "User with same email already exists"})
  }
});

router.get('/:id', async (req, res) => {
  let { id } = req.params;
  id = id.replace(":", "")
  const contact = await req.db.findContactById(id);
  res.render('contact', { contact })
})

router.get('/:id/delete', async (req, res) => { 
  let { id } = req.params;
  id = id.replace(":", "")
  const contact = await req.db.findContactById(id);
  res.render('delete', { contact })
})

router.post('/:id/delete', async (req, res) => {
  let { id } = req.params;
  id = id.replace(":", "")
  const contact = await req.db.deleteContactById(id);
  res.redirect("/");
})

router.get('/:id/edit', async (req, res) => { 
  let { id } = req.params;
  id = id.replace(":", "")
  const contact = await req.db.findContactById(id);
  res.render('edit', { contact })
})

router.post('/:id/edit', async (req, res) => { 
  let { id } = req.params;
  id = id.replace(":", "")
  const {
    first, last, phone, email, street, city, state, zip, country, contact_by_phone,
    contact_by_email, contact_by_mail
  } = req.body;

  await req.db.updateContactById(first, last, phone, email, street, city, state, zip, country, contact_by_phone, contact_by_email, contact_by_mail);

  res.redirect('/')

  // const contact = await req.db.findContactById(id)

  // res.render('edit', { contact })
})

/** 
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM Contacts WHERE ID = ?', [req.params.id], (err, row) => {
    if (err || !row) {
      return res.status(404).send('Contact not found');
    }
    res.render('contact', { contact: row });
  });
});

router.get('/:id/edit', (req, res) => {
  db.get('SELECT * FROM Contacts WHERE ID = ?', [req.params.id], (err, row) => {
    if (err || !row) {
      return res.status(404).send('Contact not found');
    }
    res.render('edit', { contact: row });
  });
});


router.post('/:id/edit', (req, res) => {
  const {
    firstName, lastName, phoneNumber, emailAddress, street, city, state, zip, country,
    contactByEmail, contactByPhone
  } = req.body;
  db.run(`UPDATE Contacts SET FirstName = ?, LastName = ?, PhoneNumber = ?, EmailAddress = ?, Street = ?, City = ?, State = ?, Zip = ?, Country = ?, ContactByEmail = ?, ContactByPhone = ?
    WHERE ID = ?`,
    [firstName, lastName, phoneNumber, emailAddress, street, city, state, zip, country, contactByEmail ? 1 : 0, contactByPhone ? 1 : 0, req.params.id], (err) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.redirect(`/${req.params.id}`);
  });
});

router.get('/:id/delete', (req, res) => {
  db.get('SELECT * FROM Contacts WHERE ID = ?', [req.params.id], (err, row) => {
    if (err || !row) {
      return res.status(404).send('Contact not found');
    }
    res.render('delete', { contact: row });
  });
});

router.post('/:id/delete', (req, res) => {
  db.run('DELETE FROM Contacts WHERE ID = ?', [req.params.id], (err) => {
    if (err) {
      return res.status
      

      */



module.exports = router;