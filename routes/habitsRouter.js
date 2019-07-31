const express = require("express");
const router = express.Router();
const db = require("../database/dbConfig");
const { authenticate } = require("../auth/authenticate");
const { calcTotalLifeGPA, allCompleteCheck, combineHabitData } = require("./habitsHelper");

// get all habits for a specific user
router.get("/:userId/user-habits", authenticate, (req, res) => {
  const { userId } = req.params;

  // Gets all habits for specific user
  db("habits")
    .where({ user_id: userId })
    .then(habits => {
      // Get all habit completion records for specific user
      db("habit_tracker")
        .where({ user_id: userId })
        .then(habitRecords => {
          // Combine habits and habit records into single array
          const finalHabits = combineHabitData(habits, habitRecords)
          // Calculate user's total life GPA
          const totalLifeGPA = calcTotalLifeGPA(finalHabits);
          // Flag indicating whether or not all habits are completed or not.
          const allComplete = allCompleteCheck(finalHabits);

          res.status(200).json({ habits: finalHabits, lifeGPA: totalLifeGPA, allComplete: allComplete });
        })
        .catch(err => {
          res.status(404).json({ err: err, message: "habit records not found" });
        });
    })
    .catch(err => {
      res.status(404).json({ error: err, message: "User not found" });
    });
});

// Add a habit
router.post("/:userId/user-habits", authenticate, (req, res) => {
  // Grab relevant info from req
  const { userId } = req.params;
  const { habitName, date_created, habitType, daysGoal, ratingGoal, countGoal, numberGoal } = req.body;

  // Combine provided habit data into 1 object to insert into the database
  const habitInfo = {
    habit_name: habitName,
    user_id: userId,
    date_created: date_created,
    last_completed: null,
    habit_type: habitType,
    days_per_week_goal: daysGoal,
    ratings_goal: ratingGoal,
    count_goal: countGoal,
    number_goal: numberGoal
  };

  // Insert new habit into database
  db("habits")
    .insert(habitInfo)
    .then(() => {
      res.status(201).json({ message: "Habit successfully added" });
    })
    .catch(err => {
      res.status(500).json({ message: "Error, habit not added" });
    });
});

// Delete a habit and habit completion records
router.delete(`/:habitId`, authenticate, (req, res) => {
  // Grab relevant info from req
  const { habitId } = req.params;

  // Find habit with specified habit id in database and delete it
  db("habits")
    .where({ id: habitId })
    .del()
    .then(() => {
      // Find all habit completion records with provided habit id and delete them
      db("habit_tracker")
        .where({ habit_id: habitId })
        .del()
        .then(() => {
          res.status(202).json({ message: "Habit data deleted" });
        })
        .catch(err => {
          res.status(404).json({ message: "Habit records not found", error: err });
        });
    })
    .catch(err => {
      res.status(404).json({ message: "Habit not found", error: err });
    });
});

// Complete a habit for today
router.post("/complete-habit", authenticate, (req, res) => {
  // Grab relevant data from req
  const { id, user_id, habit_name, last_completed, today, yesterday } = req.body;

  // Find habit with provided habit id
  db("habits")
    .where("id", id)
    .then(habit => {
      // Check if habit has already been completed today
      if (last_completed !== today) {
        // Insert completion record in database if not completed yet today
        db("habit_tracker")
          .insert({ habit_id: id, user_id, habit_name, date_completed: today })
          .then(() => {
            // Update the last completed date for the habit.
            db("habits")
              .where("id", id)
              .update({ last_completed: today })
              .then(() => {
                res.status(202).json({ message: "last_completed date updated" });
              })
              .catch(err => {
                res.status(500).json({ message: "Error, habit not added" });
              });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Error. Something happened" });
          });

      // If last_completed does equal today, habit was already completed. This will undo the completion.
      } else {
        // Find habit record with specified habit id and today's date, and delete that record
        db("habit_tracker")
          .where({ habit_id: id, date_completed: today })
          .del()
          .then(() => {
            // Find habit with provided habit id and update the last_completed date to yesterday
            db("habits")
              .where("id", id)
              .update({ last_completed: yesterday })
              .then(() => {
                res.status(202).json({ message: "last_completed reset to yesterday." });
              })
              .catch(err => {
                res.status(404).json({ message: "habit not found." });
              });
          })
          .catch(err => {
            res.status(404).json({ error: err });
          });
      }
    })
    .catch();
});

// Reset habit data
router.put("/reset-habit", authenticate, (req, res) => {
  // Grab relevant data from req
  const { id } = req.body;

  // Create today variable to use to reset the date_created field in database
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find habit with specified habit id and update the date_created and last_completed
  db("habits")
    .where({ id: id })
    .update({ date_created: today, last_completed: null }) // reset dates
    .then(() => {
      // Find all habit records with specified habit id and delete them.
      db("habit_tracker")
        .where({ habit_id: id })
        .del()
        .then(count => {
          res.status(200).json({ count: count });
        })
        .catch(err => {
          res.status(404).json({ error: err });
        });
    })
    .catch(err => {
      res.status(500).json({ error: "Update request failed" });
    });
});

module.exports = router;
