const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const storeTimes = [];

for (let i = 1; i < 8; i++) {
  const isOpen = Math.random() < 0.5;
  storeTimes.push({
    id: uuidv4(),
    day_of_week: i,
    is_open: isOpen,
    start_time: isOpen ? '09:00' : null,
    end_time: isOpen ? '18:00' : null,
  });
}
console.log(`Writing to file, ${storeTimes.length} store times`);
// write to file
fs.writeFileSync('./data/store_times.json', JSON.stringify(storeTimes, null, 2));
