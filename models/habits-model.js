const db = require("../database/dbConfig");

module.exports = {
  getHabitsByUserId,
};

function getHabitsByUserId(userId) {
  let habits = db('habits').where({ user_id: userId })
  console.log("habitInfo:", habits);
  
  let habitRecords = db('habit_tracker').where({ user_id: userId })
  console.log("habitRecords:", habitRecords);

  return Promise.all([habits, habitRecords]).then(results => {
    let [habits, habitRecords] = results;

    let result = {...habits, records: habitRecords};
    return result;
  })



  // const today = new Date();
  // today.setHours(0,0,0,0);

  // const thirtyDaysAgo = new Date(today - (1000 * 60 * 60 * 24 * 30));
  // thirtyDaysAgo.setHours(0,0,0,0);

  // let query = db("habit_tracker");

  // query.where('habit_id', '=', habitId, 'and', 'date_completed', '<=', today, 'and', 'date_completed', '>=', thirtyDaysAgo)
    
    // .then(res => {
    //   console.log(res);
    // })

  // const promises = query;

  // return Promise(promises)
  //   .then(habitRecords => {
  //     console.log("habitRecords:", habitRecords);
  //     return habitRecords;
  //   })

  // return Promise(promises)


    // db("habit_tracker")
    //   .where('habit_id', '=', habitId, 'and', 'date_completed', '<=', today, 'and', 'date_completed', '>=', thirtyDaysAgo)
    //   .then(habitRecords => {
    //     console.log("habitRecords", habitRecords);
    //     // return habitRecords;
    //   })
    //   .catch(err => {
    //     console.log("Shittttt something happened", err);
    //   })

}