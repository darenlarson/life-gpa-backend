module.exports = {
  combineHabitData,
  combineHabitsRecords,
  habitsWithGPA,
  calcTotalLifeGPA,
  allCompleteCheck
};

// Combines habits, habit records, and habit GPAs into same array to send back to client
function combineHabitData(habits, habitRecords) {
  const habitsWithRecords = combineHabitsRecords(habits, habitRecords);
  const habitsWithGPAAndRecords = habitsWithGPA(habitsWithRecords);

  return habitsWithGPAAndRecords;
}

// Combines habits and habit records into same array
function combineHabitsRecords(habits, habitRecords) {
  // Return the update habits array with habits and habit records combined
  return habits.map(habit => {
    // Finds all habit records with current habit from map's id and save them in variable 'records'
    let records = habitRecords.filter(rec => {
      return rec.habit_id === habit.id;
    });

    // Combine the current habit from map's data with the new record data
    let newHabit = { ...habit, records: records };

    // Add the new habit data to newHabitArray
    return newHabit;
  });
}

// Combines habits with habit GPAs into 1 array
function habitsWithGPA(habits) {
  // Date Variables
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today - 1000 * 60 * 60 * 24 * 30);
  const sixtyDaysAgo = new Date(today - 1000 * 60 * 60 * 24 * 60);
  const ninetyDaysAgo = new Date(today - 1000 * 60 * 60 * 24 * 90);

  // Loop over each habit the user has and return the array with the combined data
  return habits.map((habit, index) => {
    // Keep track of how many times each habit has been completed over 30, 60, and 90 days
    let thirtyCount = 0;
    let sixtyCount = 0;
    let ninetyCount = 0;

    // # of days that have passed since current habit was created
    const daysSinceCreated =
      (today - new Date(habit.date_created)) / (1000 * 60 * 60 * 24) + 1;

    // Loop over every habit complettion record in the database for each habit
    habit.records.forEach(rec => {
      // Convert the date provided from the database into the same format as local date variables
      let date_completed = new Date(rec.date_completed);

      // Increase completion counts
      if (date_completed >= thirtyDaysAgo) thirtyCount++;
      if (date_completed >= sixtyDaysAgo) sixtyCount++;
      if (date_completed >= ninetyDaysAgo) ninetyCount++;
    });

    // Initialize 30, 60, and 90 day GPAs (completion percentages)
    let thirtyGPA = 0;
    let sixtyGPA = 0;
    let ninetyGPA = 0;

    // Calculate GPAs. If habit not created 30/60/90 days ago, use daysSinceCreated in denominator instead of 30/60/90
    daysSinceCreated < 30
      ? (thirtyGPA = thirtyCount / daysSinceCreated)
      : (thirtyGPA = thirtyCount / 30);
    daysSinceCreated < 60
      ? (sixtyGPA = sixtyCount / daysSinceCreated)
      : (sixtyGPA = sixtyCount / 30);
    daysSinceCreated < 90
      ? (ninetyGPA = ninetyCount / daysSinceCreated)
      : (ninetyGPA = ninetyCount / 30);

    // Add GPAs to habit array
    let updatedHabit = {
      ...habit,
      thirtyGPA: thirtyGPA,
      sixtyGPA: sixtyGPA,
      ninetyGPA: ninetyGPA
    };

    return updatedHabit;
  });
}

// Calculates user total life GPA (combines all 30 day habit GPAs into one figure)
function calcTotalLifeGPA(habits) {
  // Intialize sum of all GPAs
  let sumGPA = 0;

  // Loop over habits array and sum up 30 day GPAs for all habits
  for (let i = 0; i < habits.length; i++) {
    sumGPA = sumGPA + habits[i].thirtyGPA;
  }

  // Divide the sum of all GPAs by number of habits to get a percentage (aka GPA)
  return sumGPA / habits.length;
}

// Checks if all habits have been completed today
function allCompleteCheck(habits) {
  // No habits have been added
  if (habits.length === 0) return false;

  // Initalize allComplete to true, check for cases where it's false
  let allComplete = true;

  // Create a today date variable and reset time to 0,0,0,0 because that's how I'm managing all my dates
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // Check the lastCompleted date for each habit
  for (let i = 0; i < habits.length; i++) {
    let lastCompleted = new Date(habits[i].last_completed);

    // Convert dates to numbers. If not equal, then habit isn't complete today, and allComplete is false.
    if (lastCompleted.getTime() !== today.getTime()) {
      allComplete = false;
      // Break since if one habit isn't complete, all are not complete
      break;
    }
  }

  return allComplete;
}
