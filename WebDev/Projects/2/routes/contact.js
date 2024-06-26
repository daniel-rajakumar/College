const express = require('express');
const router = express.Router();
const db = require('../db/contactDB');

router.get('/create', async (req, res) => {
  res.render('create');
});

router.post('/create', async (req, res) => {
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

})



module.exports = router;