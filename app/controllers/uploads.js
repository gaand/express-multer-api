'use strict';

const controller = require('lib/wiring/controller');
const models = require('app/models');

const middleware = require('app/middleware');

const multer = middleware['multer'];

const awsS3Upload = require('lib/aws-s3-upload');

const mime = require('mime-types');
const path = require('path');

const Upload = models.upload;

const index = (req, res, next) => {
  Upload.find()
    .then(uploads => res.json({ uploads }))
    .catch(err => next(err));
};

const show = (req, res, next) => {
  Upload.findById(req.params.id)
    .then(upload => upload ? res.json({ upload }) : next())
    .catch(err => next(err));
};

const extension = (mimetype, filename) =>
  mime.extension(mimetype) || path.extname(filename).replace(/^./, '');

const create = (req, res, next) => {
  let upload = {
    data: req.file.buffer,
    ext: extension(req.file.mimetype, req.file.originalname),
    mime: req.file.mimetype,
  };
  awsS3Upload(upload)
  .then((s3response) => {
    let upload = {
      location: s3response.Location,
      title: req.body.upload.title,
    };
    return Upload.create(upload);
  })
  .then((upload) => {
    res.status(201).json({ upload });
  })
  .catch(err => next(err));

};

const update = (req, res, next) => {
  let search = { _id: req.params.id, _owner: req.currentUser._id };
  Upload.findOne(search)
    .then(upload => {
      if (!upload) {
        return next();
      }

      delete req.body._owner;  // disallow owner reassignment.
      return upload.update(req.body.upload)
        .then(() => res.sendStatus(200));
    })
    .catch(err => next(err));
};

const destroy = (req, res, next) => {
  let search = { _id: req.params.id, _owner: req.currentUser._id };
  Upload.findOne(search)
    .then(upload => {
      if (!upload) {
        return next();
      }

      return upload.remove()
        .then(() => res.sendStatus(200));
    })
    .catch(err => next(err));
};

module.exports = controller({
  index,
  create,
}, { before: [
  { method: multer.single('upload[file]'), only: ['create'] },
], });
