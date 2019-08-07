const db = require("../database/dbConfig");

module.exports = {
  getHabits: async function(userId) {
    // Get all habits for this user
    let habits = await db("habits").where({ user_id: userId });

    // Attach the habit records to each habit
    const habitsRecords = await this.combineHabitsAndRecords(habits, userId);

    // NEW CODE
    habitsRecords.forEach(habit => {
      if (habit.habit_type === "normal") {
        habit.completions_this_week = this.normalHabitStreaks(habit);
      }
    });
    // END NEW CODE

    return habitsRecords;
  },

  combineHabitsAndRecords: async function(habits, userId) {
    let allHabitRecords = await db("habit_tracker").where({ user_id: userId });

    return habits.map(habit => {
      const records = allHabitRecords.filter(habitRecord => {
        return habitRecord.habit_id === habit.id;
      });
      return { ...habit, records };
    });
  },

  normalHabitStreaks: function(habit) {
    const today = new Date();
    const sunday = new Date(today - today.getDay() * (1000 * 60 * 60 * 24));

    let completionCount = 0;
    habit.records.forEach(record => {
      if (new Date(record.date_completed) >= sunday) {
        completionCount++;
      }
    });
    return completionCount;
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
    const {
      id,
      user_id,
      habit_name,
      habit_type,
      last_completed,
      last_value_added,
      today,
      yesterday,
      rating,
      count,
      number
    } = habitData;
    console.log(habitData);

    // If habit data hasn't been submitted today, go ahead and submit it.
    if (last_completed !== today) {
      return db("habit_tracker")
        .insert({
          habit_id: id,
          user_id,
          habit_name,
          date_completed: today,
          rating: rating,
          count: count,
          number: number
        })
        .then(() => {
          return db("habits")
            .where("id", id)
            .update({
              last_completed: today,
              last_value_added: last_value_added
            });
        });

      // If habit data has been submitted today, and this is a 'normal' habit type, remove the habit record and update the last_completed date in the habits table
    } else if (habit_type === "normal") {
      return db("habit_tracker")
        .where({ habit_id: id, date_completed: today })
        .del()
        .then(() => {
          return db("habits")
            .where("id", id)
            .update({ last_completed: yesterday });
        });

      // If habit data has been submitted today and it isn't a 'normal' habit type, update the record that is already in the habit_tracker table
    } else {
      return db("habit_tracker")
        .where({ habit_id: id, date_completed: today })
        .update({ rating: rating, count: count, number: number })
        .then(() => {
          return db("habits")
            .where("id", id)
            .update({ last_value_added: last_value_added });
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
          .del();
      });
  }
};
