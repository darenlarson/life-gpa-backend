
exports.up = function(knex, Promise) {
    return knex.schema.createTable('habits', habits => {
        habits.increments();

        habits.string('habit_name').notNullable();

        habits.integer('user_id').notNullable().references('id').inTable('users');

        habits.date('date_created');

        habits.date('last_completed');
    }) 
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('habitss');
};