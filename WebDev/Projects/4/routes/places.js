const express = require('express')
const router = express.Router();
const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap',  
        headers: { 'user-agent': 'My application <email@domain.com>', } 
});

router.get('/', async (req, res) => {
  const places = await req.db.findPlaces();
  res.json({ places })
})

router.put('/', async (req, res) => {
  const label = req.body.label;
  const address = req.body.address;
  let lat = 0, lng = 0;

  const result = await geocoder.geocode(address);

  if (result.length > 0) {
    lat = result[0].latitude 
    lng = result[0].longitude 
  }

  const id = await req.db.createPlace(label, address, lat, lng);
  res.json({ id });
})

router.delete('/:id', async(req, res) => {
  await req.db.deletePlace(req.params.id)
  res.status(200).send();
})

module.exports = router