'use strict';

const express = require('express');
const morgan = require('morgan');

const { PORT } = require('./config');
const notesRouter = require('./routers/notes.router');

// Create an Express application
const app = express();

// Log all requests
app.use(morgan('common'));

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());

// Mount router on "/v1"
app.use('/v1', notesRouter);

// Catch-all 404
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// NOTE: we'll prevent stacktrace leak in later exercise
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

// Promisify `listen` and resulting `server`
function runServer(port) {
  return new Promise((resolve, reject) => {
    app.listen(port, function () {
      const server = this;
      const util = require('util');
      server.closeServer = util.promisify(server.close);
      resolve(server);
    }).on('error', reject);
  });
}

runServer(PORT)
  .then(server => {
    console.info(`Server listening on ${server.address().port}`);
  })
  .catch(console.error);
