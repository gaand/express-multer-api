'use strict';

const fs = require('fs');
const fileType = require('file-type');

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

const awsUpload = (file) => {
  const options = {
    ACL: 'public-read',
    Body: file.data,
    Bucket: 'gaand-011',
    ContentType: file.mime,
    Key: `test/test.${file.ext}`,
  };
  return Promise.resolve(options);
};

readFile(filename)
.then((data) => {
  let file = mimeType(data);
  file.data = data;
  return file;
})
.then(awsUpload)
.then((options) =>
  console.log(options))
.catch(console.error);
