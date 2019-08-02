const express = require("express");
const router = express.Router();
const { authenticate } = require("../auth/authenticate");
const habitsDb = require("./habitsHelper");

// get all habits for a specific user
router.get("/:userId/user-habits", authenticate, (req, res) => {
  habitsDb.get(req.params.userId)
    .then(habits => res.status(200).json({ habits: habits }))
    .catch(err => res.status(404).json({ err: err, message: "User habits not found" }));
});


// Add a new habit
router.post("/:userId/user-habits", authenticate, (req, res) => {
  habitsDb.add(req.body)
    .then(() => res.status(201).json({ message: "Habit successfully added" }))
    .catch(err => res.status(500).json({ err: err, message: "Error, habit not added" }));
});


// Delete a habit and habit completion records
router.delete(`/:habitId`, authenticate, (req, res) => {
  habitsDb.delete(req.params.habitId)
    .then(() => res.status(202).json({ message: "Habit data deleted" }))
    .catch(err => res.status(404).json({ message: "Habit not found", error: err }));
});


// ***** NEEDS TO BE UPDATED FOR NEW VERSION OF APP *****
// Complete a habit for today
router.post("/complete-habit", authenticate, (req, res) => {
  habitsDb.completeHabit(req.body)
    .then(() => res.status(202).json({ message: "last_completed date updated" }))
    .catch(err => res.status(500).json({ message: "Error. Something happened" }));
});


// Reset habit data
router.put("/reset-habit", authenticate, (req, res) => {
  habitsDb.resetHabit(req.body.id, req.body.today)
    .then(count => res.status(200).json({ count: count }))
    .catch(err => res.status(404).json({ error: err }));
});

module.exports = router;
