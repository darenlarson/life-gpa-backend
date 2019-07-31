
exports.up = function(knex, Promise) {
    return knex.schema.createTable('habits', habits => {
        habits.increments();
        habits.string('habit_name').notNullable();
        habits.integer('user_id').notNullable().references('id').inTable('users');
        habits.date('date_created');
        habits.date('last_completed');
        habits.string('habit_type').notNullable();
        habits.integer('days_per_week_goal');
        habits.string('specific_days');
        habits.integer('ratings_goal');
        habits.integer('count_goal');
        habits.integer('number_goal');
    }) 
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('habits');
};