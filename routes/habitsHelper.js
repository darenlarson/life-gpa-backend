const db = require("../database/dbConfig");

module.exports = {
  getHabits: async function(userId) {
    // Get all habits for this user
    let habits = await db("habits").where({ user_id: userId });
    // Attach the habit records to each habit
    const habitsRecords = await this.combineHabitsAndRecords(habits, userId);
    // Attaches record summary data to each habit
    habitsRecords.forEach(habit => {
      // If normal habit, calculate completions this week and current streak
      if (habit.habit_type === "normal") {
        habit.summaryData = this.normalHabitStreaks(habit);
      }
    });

    return habitsRecords;
  },

  // Combines all habits with each habits' records
  combineHabitsAndRecords: async function(habits, userId) {
    // Get all habit records for this user
    let allHabitRecords = await db("habit_tracker").where({ user_id: userId });
    // Loop over habits and attach an array of all of its habit records
    return habits.map(habit => {
      const records = allHabitRecords.filter(habitRecord => {
        return habitRecord.habit_id === habit.id;
      });
      return { ...habit, records };
    });
  },

  // Calculates current streak and completions for current week
  normalHabitStreaks: function(habit) {
    // Save current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Save first day of this week (sunday)
    const firstDayThisWeek = new Date(today - today.getDay() * (1000 * 60 * 60 * 24));

    let completedThisWeekCount = 0;
    // Loop over all records. If record date is after sunday, increment count for completions this week
    habit.records.forEach(record => {
      if (new Date(record.date_completed) >= firstDayThisWeek)
        completedThisWeekCount++;
    });

    // Save date habit was created
    const date_created = new Date(habit.date_created);
    // Save the last day of the week (saturday) of the current habit record.
    let weekEnd = new Date(date_created);
    weekEnd.setDate(weekEnd.getDate() + (6 - date_created.getDay()));

    let fullStreak = 0;
    let weekCount = 0;
    
    habit.records
      // First sort the records by date
      .sort((a, b) => new Date(a.date_completed) - new Date(b.date_completed))
      // Then loop over each record
      .forEach(record => {
        const date_completed = new Date(record.date_completed);
        // Increment weekCount so we can compare it to the weekly goal. Keep track of fullStreak
        if (date_completed <= weekEnd) {
          weekCount++;
          fullStreak++;
        // Else we've hit a date that is in a new week
        } else {
          // WeekCount didn't meet weekly goal, so reset streak to 1
          if (weekCount < habit.days_per_week_goal) {
            fullStreak = 1;
          // Otherwise we met the weekly goal, so keep incrementing streak
          } else {
            fullStreak++;
          }
          // In a new week, so reset weekCount
          weekCount = 1;
          // In a new week, so reset the last day of the week to the next saturday
          weekEnd = new Date(date_completed);
          weekEnd.setDate(weekEnd.getDate() + (6 - date_completed.getDay()));
        }
      });

    return { completions_this_week: completedThisWeekCount, streak: fullStreak};
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
