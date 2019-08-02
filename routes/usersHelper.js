const db = require("../database/dbConfig");

module.exports = {
  findBy: function(filter) {
    return db("users").where(filter);
  },
  addUser: function(user) {
    return db("users")
      .insert(user)
      .returning("id")
      .then(ids => {
        return getUser(ids[0]);
      });
  },

  getUser: function(id) {
    return db("users")
      .where({ id })
      .first();
  }
};
