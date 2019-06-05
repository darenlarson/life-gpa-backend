const express = require("express");
const router = express.Router();
const db = require("../database/dbConfig");
const { authenticate } = require("../auth/authenticate");
const { calcTotalLifeGPA, allCompleteCheck, combineHabitData } = require("./habitsHelper");

// get all habits for a specific user
router.get("/:userId/user-habits", authenticate, (req, res) => {
  const { userId } = req.params;

  db("habits")
    .where({ user_id: userId })
    .then(habits => {
      db("habit_tracker")
        .where({ user_id: userId })
        .then(habitRecords => {
          const finalHabits = combineHabitData(habits, habitRecords)
          const totalLifeGPA = calcTotalLifeGPA(finalHabits);
          const allComplete = allCompleteCheck(finalHabits);

          res.status(200).json({ habits: finalHabits, lifeGPA: totalLifeGPA, allComplete: allComplete });
        })
        .catch(err => {
          res.status(500).json(err);
        });
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// add a habit
router.post("/:userId/user-habits", authenticate, (req, res) => {
  const { userId } = req.params;
  const { habit, date_created } = req.body;

  const habitInfo = {
    habit_name: habit,
    user_id: userId,
    date_created: date_created,
    last_completed: null
  };

  db("habits")
    .insert(habitInfo)
    .then(() => {
      res.status(201).json({ message: "Habit successfully added" });
    })
    .catch(err => {
      res.status(500).json({ message: "Error, habit not added" });
    });
});

// delete a habit
router.delete(`/:habitId`, authenticate, (req, res) => {
  const { habitId } = req.params;

  db("habits")
    .where({ id: habitId })
    .del()
    .then(() => {
      console.log("habitId:", habitId);
      db("habit_tracker")
        .where({ habit_id: habitId })
        .del()
        .then(() => {
          res.status(200).json({ message: "Habit data deleted" });
        })
        .catch(err => {
          console.log(err);
          res
            .status(404)
            .json({ message: "Habit records not found", error: err });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(404).json({ message: "Habit not found", error: err });
    });
});

// complete a habit
router.post("/complete-habit", authenticate, (req, res) => {
  // console.log(req.body);
  const {
    id,
    user_id,
    habit_name,
    last_completed,
    today,
    yesterday
  } = req.body;

  // console.log("last_completed", last_completed);
  // console.log("today", today);

  db("habits")
    .where("id", id)
    .then(habit => {
      if (last_completed !== today) {
        db("habit_tracker")
          .insert({ habit_id: id, user_id, habit_name, date_completed: today })
          .then(() => {
            db("habits")
              .where("id", id)
              .update({ last_completed: today })
              .then(() => {
                res
                  .status(202)
                  .json({ message: "last_completed date updated" });
              })
              .catch(err => {
                res.status(500).json({ message: "Error, habit not added" });
              });
          })
          .catch(err => {
            // console.log(err);
            res.status(500).json({ message: "Error. Something happened" });
          });
      } else {
        db("habit_tracker")
          .where({ habit_id: id, date_completed: today })
          .del()
          .then(() => {
            db("habits")
              .where("id", id)
              .update({ last_completed: yesterday })
              .then(() => {
                res
                  .status(202)
                  .json({ message: "last_completed reset to yesterday." });
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

// undo a completed habit
router.delete("/complete-habit", authenticate, (req, res) => {
  const { userId, habitId, todayDate } = req.body;

  db("habit_tracker")
    .where({ habit_id: habitId, user_id: userId, date_completed: todayDate })
    .del()
    .then(count => {
      res.status(200).json({ message: "Successfully deleted" });
    })
    .catch(err => {
      res.status(500).json({ error: "Delete request failed" });
    });
});

// Reset habit data
router.put("/reset-habit", authenticate, (req, res) => {
  const { date_created, id } = req.body;

  db("habits")
    .where({ id: id })
    .update({ date_created: date_created, last_completed: null })
    .then(() => {
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
