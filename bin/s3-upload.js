'use strict';

require('dotenv').config();

const fs = require('fs');
const crypto = require('crypto');

const fileType = require('file-type');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

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

const randomHexString = (length) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString('hex'));
      }
    });
  });


const awsUpload = (file) =>
  randomHexString(16)
  .then((filename) => {
    let dir = new Date().toISOString().split('T')[0];
    return {
      ACL: 'public-read',
      Body: file.data,
      Bucket: 'gaand-011',
      ContentType: file.mime,
      Key: `${dir}/${filename}.${file.ext}`,
    };
  }).then(params =>
    new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    })
  );

readFile(filename)
.then((data) => {
  let file = mimeType(data);
  file.data = data;
  return file;
})
.then(awsUpload)
.then((s3response) =>
  console.log(s3response))
.catch(console.error);
