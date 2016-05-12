'use strict';

require('dotenv').config();

const fs = require('fs');

const fileType = require('file-type');

const awsS3Upload = require('../lib/aws-s3-upload');

const mongoose = require('../app/middleware/mongoose');
const Upload = require('../app/models/upload');

// always return object with extension and mime.
// fileType returns null when no match
const mimeType = (data) =>
  Object.assign({
    ext: 'bin',
    mime: 'application/octet-stream',
  }, fileType(data));

let filename = process.argv[2] || '';
let title = process.argv[3] || 'No Title';

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
.then((s3response) => {
  let upload = {
    location: s3response.Location,
    title: title,
  };
  return Upload.create(upload);
})
.then(console.log)
.catch(console.error)
.then(() => mongoose.connection.close());
