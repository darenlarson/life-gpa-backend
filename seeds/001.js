
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {first_name: 'Daren', last_name: 'Larson', username: 'darenlarson', password: 'pass'},
      ]);
    });
};
