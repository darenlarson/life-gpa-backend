module.exports = {
  combineHabitData,
  combineHabitsRecords,
  habitsWithGPA,
  calcTotalLifeGPA,
  allCompleteCheck
};

function combineHabitData(habits, habitRecords) {
  const habitsWithRecords = combineHabitsRecords(habits, habitRecords);
  const habitsWithGPAAndRecords = habitsWithGPA(habitsWithRecords);

  return habitsWithGPAAndRecords;
}

function combineHabitsRecords(habits, habitRecords) {
  const newHabitArray = habits.map(habit => {
    let records = habitRecords.filter(rec => {
      return rec.habit_id === habit.id;
    });

    let newHabit = { ...habit, records: records };

    return newHabit;
  });

  return newHabitArray;
}

function habitsWithGPA(habits) {
  // Date Variables
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today - 1000 * 60 * 60 * 24 * 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const sixtyDaysAgo = new Date(today - 1000 * 60 * 60 * 24 * 60);
  sixtyDaysAgo.setHours(0, 0, 0, 0);
  const ninetyDaysAgo = new Date(today - 1000 * 60 * 60 * 24 * 90);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  // Loop over each habit the user has
  const finalHabitsArray = habits.map((habit, index) => {
    let thirtyCount = 0;
    let sixtyCount = 0;
    let ninetyCount = 0;
    
    // # of days that have passed since current habit iteration was created.
    const daysSinceCreated =
      (today - new Date(habit.date_created)) / (1000 * 60 * 60 * 24) + 1;

    // Loop over every record in the database for each habit.
    habit.records.forEach(rec => {
      // Convert the date provided from the database into the same format as local date variables.
      let date_completed = new Date(rec.date_completed);

      if (date_completed >= thirtyDaysAgo) thirtyCount++;
      if (date_completed >= sixtyDaysAgo) sixtyCount++;
      if (date_completed >= ninetyDaysAgo) ninetyCount++;
    });

    let thirtyGPA = 0;
    let sixtyGPA = 0;
    let ninetyGPA = 0;

    if (daysSinceCreated < 30) {
      thirtyGPA = thirtyCount / daysSinceCreated;
    } else {
      thirtyGPA = thirtyCount / 30;
    }

    if (daysSinceCreated < 60) {
      sixtyGPA = sixtyCount / daysSinceCreated;
    } else {
      sixtyGPA = sixtyCount / 30;
    }

    if (daysSinceCreated < 90) {
      ninetyGPA = ninetyCount / daysSinceCreated;
    } else {
      ninetyGPA = ninetyCount / 30;
    }

    let updatedHabit = {...habit, thirtyGPA: thirtyGPA, sixtyGPA: sixtyGPA, ninetyGPA: ninetyGPA };

    return updatedHabit;
  });

  return finalHabitsArray;
}

function calcTotalLifeGPA(habits) {
  const GPA = habits.map(habit => {
    return habit.thirtyGPA;
  });

  let sumGPA = 0;

  for (let i = 0; i < GPA.length; i++) {
    sumGPA = sumGPA + GPA[i];
  }

  const totalLifeGPA = sumGPA / GPA.length;

  return totalLifeGPA;
}

function allCompleteCheck(habits) {
  let allComplete = true;
  let lastCompleted;

  for (let i = 0; i < habits.length; i++) {
    lastCompleted = new Date(habits[i].last_completed);
    let stringLastCompleted = lastCompleted.toString();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let stringToday = today.toString();

    if (stringLastCompleted !== stringToday) {
      allComplete = false;
      break;
    }
  }

  return allComplete;
}
