const map = L.map('map').setView([41.08, -74.17], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const markers = [];

const addMarker = (place) => {
  const marker = L.marker([place.lat, place.lng]).addTo(map)
    .bindPopup(`<b>${place.label}</b><br/>${place.address}`);
  markers.push(marker);
}

const clearMarkers = () => {
  markers.forEach(marker => map.removeLayer(marker));
  markers.length = 0;
}

const on_row_click = (e) => {
  let row = e.target;

  if (e.target.tagName.toUpperCase() === 'TD') {
    row = e.target.parentNode;
  }

  const { lat, lng } = row.dataset
  map.flyTo(new L.LatLng(lat, lng));
}

const addPlace = async () => {
  const label = document.querySelector('#label').value;
  const address = document.querySelector('#address').value;
  const place = await axios.put('/places', { label, address });
  const { latitude, longitude } = place.data

  map.flyTo(new L.LatLng(latitude, longitude));
  await loadPlaces();
}

const deletePlace = async (id) => {
  await axios.delete(`/places/${id}`)
  clearMarkers()
  await loadPlaces()
}

const loadPlaces = async () => {
  const response = await axios.get('/places');
  const tbody = document.querySelector('tbody');

  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  
  if (response?.data?.places){
    for (const place of response.data.places){
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${place.label}</td>
        <td>${place.address}</td>
        <td>
          <button class='btn btn-danger' type='button' onclick=deletePlace(${place.id})>Delete</button>
        </td>
      `
      tr.dataset.lat = place.lat;
      tr.dataset.lng = place.lng;
      tr.onclick = on_row_click;

      addMarker(place)
      tbody.appendChild(tr);
    }


  }

}