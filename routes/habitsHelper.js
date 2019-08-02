const db = require("../database/dbConfig");

module.exports = {
  get: function(userId) {
    return db("habits").where({ user_id: userId });
  },

  add: function(habitData) {
    return db("habits").insert(habitData);
  },

  delete: function(habitId) {
    return db("habits")
      .where({ id: habitId })
      .del()
      .then(() => {
        return db("habit_tracker")
          .where({ habit_id: habitId })
          .del();
      });
  },

  completeHabit: function(habitData) {
    const { id, user_id, habit_name, last_completed, today, yesterday, rating, count, number } = habitData;
    console.log(habitData);

    if (last_completed !== today) {
      return db("habit_tracker")
        .insert({ habit_id: id, user_id, habit_name, date_completed: today, rating: rating, count: count, number: number })
        .then(() => {
          return db("habits")
            .where("id", id)
            .update({ last_completed: today });
        });
    } else {
      return db("habit_tracker")
        .where({ habit_id: id, date_completed: today })
        .del()
        .then(() => {
          return db("habits")
            .where("id", id)
            .update({ last_completed: yesterday });
        });
    }
  },

  resetHabit: function(habitId, today) {
    return db("habits")
      .where({ id: habitId })
      .update({ date_created: today, last_completed: null })
      .then(() => {
        return db("habit_tracker")
          .where({ habit_id: habitId })
          .del()
      })
  }
};
