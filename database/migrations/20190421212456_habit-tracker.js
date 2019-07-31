
exports.up = function(knex, Promise) {
  return knex.schema.createTable('habit_tracker', tbl => {
    tbl.increments();
    tbl.integer('habit_id').notNullable().references('id').inTable('habits')
    tbl.integer('user_id').notNullable().references('id').inTable('users')
    tbl.string('habit_name').notNullable()
    tbl.date('date_completed')
    tbl.integer('rating');
    tbl.integer('count');
    tbl.integer('number');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('habit_tracker')
};
