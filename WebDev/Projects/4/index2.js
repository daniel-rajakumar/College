const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap',  
        headers: {
          'user-agent': 'My application <email@domain.com>',
        } 
});

// Using callback
const get = async () => {
  console.log("one")
  const code = await geocoder.geocode("505 Ramapo Valley Road, Mahwah NJ")
  console.log(code[0].latitude, code[0].longitude)
  console.log("two")
  return code;
}

console.log(get());



