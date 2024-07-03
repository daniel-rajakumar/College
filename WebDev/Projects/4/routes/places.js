const express = require('express')
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ 
  provider: 'openstreetmap',  
  headers: { 'user-agent': 'My application <email@domain.com>', } 
});

router.get('/', async (req, res) => {
  const places = await req.db.findPlaces();
  res.json({ places })
})

router.put('/', async (req, res) => {
  const { label, address } = req.body

  const result = await geocoder.geocode(address);

  if (result.length > 0) {
    const { latitude, longitude, formattedAddress } = result[0];
    const id = await req.db.createPlace(label, formattedAddress, latitude, longitude);
    res.json({ id, label, formattedAddress, latitude, longitude });

  } else {
    console.error("[ERROR]", "No results found")
    res.status(404).send();
  }
})

router.delete('/:id', async(req, res) => {
  await req.db.deletePlace(req.params.id)
  res.status(200).send();
})

module.exports = router