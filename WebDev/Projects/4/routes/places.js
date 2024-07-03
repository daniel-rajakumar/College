const express = require('express')
const router = express.Router();

router.get('/', async (req, res) => {
  const places = await req.db.findPlaces();
  res.json({ places })
})

router.put('/', async (req, res) => {
  const label = req.body.label;
  const address = req.body.address;
  const id = await req.db.createPlace(label, address);
  res.json({ id });
})

router.delete('/:id', async(req, res) => {
  await req.db.deletePlace(req.params.id)
  res.status(200).send();
})

module.exports = router