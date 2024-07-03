const addPlace = async () => {
  const label = document.querySelector('#label').value;
  const address = document.querySelector('#address').value;
  await axios.put('/places', { label, address })
  await loadPlaces();
}

const deletePlace = async (id) => {
  await axios.delete(`/places/${id}`)
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
      tbody.appendChild(tr);
    }
  }
}
          // <button class='btn btn-danger' onclick="deletePlace(${place.id})">Delete</button>