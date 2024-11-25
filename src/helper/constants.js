exports.generateRandomAlphanumeric = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return result;
}

exports.getCommonValuesFromObject = (obj, arr) => {
  const commonKeyValuePairs = {};
  for (const key in obj) {
      if (arr.includes(key)) {
          commonKeyValuePairs[key] = obj[key];
      }
  }
  return commonKeyValuePairs;
}

exports.getMonthName = (monthNumber) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const index = monthNumber - 1;  
  // Check if the input monthNumber is valid
  if (index >= 0 && index < months.length) {
    return months[index];
  } else {
    return false;
  }
}

exports.combineDateTime = (timeString) => {
  // Get the current date
  const currentDate = new Date();
  
  // Parse the time string
  const [time, period] = timeString.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  // Adjust hours for AM/PM
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  // Create a new Date object with the current date and specified time
  const combinedDateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours, minutes, 0, 0);

  // Format the combined date and time for MySQL (YYYY-MM-DD HH:MM:SS)
  const year = combinedDateTime.getFullYear();
  const month = String(combinedDateTime.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(combinedDateTime.getDate()).padStart(2, '0');
  const hour = String(combinedDateTime.getHours()).padStart(2, '0');
  const minute = String(combinedDateTime.getMinutes()).padStart(2, '0');
  const second = String(combinedDateTime.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  return formattedDate;
}

exports.getDayName = (dayNumber) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Staturday"];
  const index = dayNumber - 1;  
  // Check if the input dayNumber is valid
  if (index >= 0 && index < days.length) {
    return days[index];
  } else {
    return false;
  }
}
exports.getShortDayName = (dayNumber) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri","Sat"];
  const index = dayNumber - 1;  
  // Check if the input dayNumber is valid
  if (index >= 0 && index < days.length) {
    return days[index];
  } else {
    return false;
  }
}

exports.getShortAndFullDayName = (days) => {
  const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri","Sat"];
  const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Staturday"];
  let response = {
    shortDays: [],
    fullDays: []
  };
  
  days.split(',').forEach(day => {
    const dayIndex = parseInt(day) - 1; // Convert to zero-based index
    if (dayIndex >= 0 && dayIndex < shortDays.length) {
      response.shortDays.push(shortDays[dayIndex]);
    }
    if (dayIndex >= 0 && dayIndex < fullDays.length) {
      response.fullDays.push(fullDays[dayIndex]);
    }
  });
  return response;
}

exports.getWeekStartAndEndDate = (date) => {
  let startDate = new Date(date);
  let endDate = new Date(date);

  // Adjust start to the previous Sunday
  startDate.setDate(date.getDate() - date.getDay());

  // Adjust end to the following Saturday
  endDate.setDate(date.getDate() + (6 - date.getDay()));

  return { startDate, endDate };
}

exports.generateRandomNumber = (len = 4) => {
  let digits = "0123456789";
  let randomNumber = "";
  let charLen = digits.length;
  for (let i = 0; i < len; i++) {
    randomNumber += digits[Math.floor(Math.random() * charLen)];
  }
  return randomNumber;
};