const conn = require('./lib/mysql');
const {faker} = require('@faker-js/faker');

async function seed () {

    faker.person.fullName()
    for(let i = 0; i < 1000; i++) {
        await conn.query(`insert into Students (name, surname, created_at) 
            value ("${faker.person.firstName()}", "${faker.person.lastName()}", now())
        `);
    }
}

seed();