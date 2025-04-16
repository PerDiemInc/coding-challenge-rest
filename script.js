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

const storeOverwrites = [];

for (let i = 1; i < 8; i++) {
  const isOpen = Math.random() < 0.5;
  const endTime = Math.floor(Math.random() * 24);
  const startTime = endTime - Math.floor(Math.random() * 2);
  storeOverwrites.push({
    id: uuidv4(),
    // Day is generate from 1-28
    day: Math.floor(Math.random() * 28) + 1,
    // Month is generate from 1-12
    month: Math.floor(Math.random() * 12) + 1,
    is_open: isOpen,
    // hours are generated from 0-23
    end_time: endTime.toString().padStart(2, '0') + ':00',
    start_time: startTime.toString().padStart(2, '0') + ':00',
  });
}
console.log(`Writing to file, ${storeOverwrites.length} store overwrites`);
// write to file
fs.writeFileSync('./data/store_overwrite.json', JSON.stringify(storeOverwrites, null, 2));
