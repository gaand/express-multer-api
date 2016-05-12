'use strict';

require('dotenv').config();

const fs = require('fs');

const fileType = require('file-type');

const awsS3Upload = require('../lib/aws-s3-upload');

// always return object with extension and mime.
// fileType returns null when no match
const mimeType = (data) =>
  Object.assign({
    ext: 'bin',
    mime: 'application/octet-stream',
  }, fileType(data));

let filename = process.argv[2] || '';

const readFile = (filename) =>
  new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });



readFile(filename)
.then((data) => {
  let file = mimeType(data);
  file.data = data;
  return file;
})
.then(awsS3Upload)
.then((s3response) =>
  console.log(s3response))
.catch(console.error);
