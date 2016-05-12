'use strict';

const fs = require('fs');

let filename = process.argv[2] || '';

fs.readFile(filename, (err, data) => {
  if (err) {
    return console.error(err);
  }

  console.log(`${filename} is ${data.length} bytes long`);
});
