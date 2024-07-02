require('dotenv').config();
const Database = require('dbcmps369');

class PlacesDB {
  constructor() {
    this.db = new Database();
  }

  async initialize() {
    await this.db.connect();
    await this.db.schema('Place', [
      {name: 'id', type: 'INTEGER'},
      {name: 'label', type: 'TEXT'},
      {name: 'address', type: 'TEXT'}
    ], 'id')
  }

  async findPlaces(){
    const places = await this.db.read('Place', [])
    return places;
  }

  async createPlace(label, address){
    const id = await this.db.create('Place', [
      { column: 'label', value: label },
      { column: 'address', value: address }
    ])
    return id;
  }


  async deletePlace(id){
    await this.db.delete('Place', [{ column: 'id', value: id }])
  }
}

module.exports = PlacesDB;