const db = require('../database/dbConfig');

module.exports = {
    addUser,
    getUser,
    findBy
}

function findBy(filter) {
    return db('users').where(filter);
  }

function addUser(user) {
    return db('users')
    .insert(user)
    .returning('id')
    .then(ids => {
        return getUser(ids[0]);
    })
}

function getUser(id) {
    return db('users')
        .where({ id })
        .first();
}