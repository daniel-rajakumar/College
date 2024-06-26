require('dotenv').config();
const Database = require('../db/cmps369.js');

class ContactDB {

    constructor() {
        this.db = new Database();
        console.log('DB:', this.db);
    }


    async initialize() {
        await this.db.connect();

        await this.db.schema('Contact', [
            { name: 'id', type: 'TEXT' },
            { name: 'first', type: 'TEXT' },
            { name: 'last', type: 'TEXT' },
            { name: 'phone', type: 'TEXT' },
            { name: 'email', type: 'TEXT' },
            { name: 'street', type: 'TEXT' },
            { name: 'city', type: 'TEXT' },
            { name: 'state', type: 'TEXT' },
            { name: 'zip', type: 'TEXT' },
            { name: 'country', type: 'TEXT' },
            { name: 'contact_by_phone', type: 'INTEGER' },
            { name: 'contact_by_email', type: 'INTEGER' },
            { name: 'contact_by_mail', type: 'INTEGER' },
        ], 'id');

        await this.db.schema('Users', [
            { name: 'id', type: 'TEXT' },
            { name: 'first', type: 'TEXT' },
            { name: 'last', type: 'TEXT' },
            { name: 'username', type: 'TEXT' },
            { name: 'password', type: 'TEXT' }
        ], 'id');

    }

    async findUserByUsername(username) {
        const us = await this.db.read('Users', [{ column: 'username', value: username }]);
        if (us.length > 0) return us[0];
        else {
            return undefined;
        }
    }

    async createUser(username, password) {
        const id = await this.db.create('Users', [
            { column: 'username', value: username },
            { column: 'password', value: password },
        ])
        return id;
    }


    async findUserById(id) {
        const us = await this.db.read('Users', [{ column: 'id', value: id }]);
        if (us.length > 0) return us[0];
        else {
            return undefined;
        }
    }


    async createContact(first, last, phone, email, street, city, state, zip, country, contact_by_phone, contact_by_email, contract_by_mail, contact_by_mail) {

        const id = await this.db.create('Contact', [
            { column: 'id', value: email },
            { column: 'first', value: first },
            { column: 'last', value: last },
            { column: 'phone', value: phone },
            { column: 'email', value: email },
            { column: 'street', value: street },
            { column: 'city', value: city },
            { column: 'state', value: state },
            { column: 'zip', value: zip },
            { column: 'country', value: country },
            { column: 'contact_by_phone', value: contact_by_phone },
            { column: 'contact_by_email', value: contact_by_email },
            { column: 'contact_by_mail', value: contract_by_mail },
        ]);

        return id;
    }

    async findContactById(id) {
        const us = await this.db.read('Contact', [{ column: 'id', value: id }]);
        if (us.length > 0) return us[0];
        else {
            return undefined;
        }
    }

    async deleteContactById(id) {
        const us = await this.db.delete('Contact', [{ column: 'id', value: id }]);
        if (us.length > 0) return us[0];
        else {
            return undefined;
        }
    }

    async updateContactById(first, last, phone, email, street, city, state, zip, country, contact_by_phone, contact_by_email, contract_by_mail, contact_by_mail) {
        const us = await this.db.update('Contact', [
            { column: 'id', value: email },
            { column: 'first', value: first },
            { column: 'last', value: last },
            { column: 'phone', value: phone },
            { column: 'email', value: email },
            { column: 'street', value: street },
            { column: 'city', value: city },
            { column: 'state', value: state },
            { column: 'zip', value: zip },
            { column: 'country', value: country },
            { column: 'contact_by_phone', value: contact_by_phone },
            { column: 'contact_by_email', value: contact_by_email },
            { column: 'contact_by_mail', value: contract_by_mail },
        ],  [{ column: 'id', value: email }]);

        console.log("us:::::", us)

        if (us.length > 0) return us;
        else {
            return undefined;
        }
    }

    async readAllContacts() {
        const contacts = await this.db.readAll('Contact');
        return contacts;
    }

}

module.exports = ContactDB;