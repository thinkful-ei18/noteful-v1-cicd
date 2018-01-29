'use strict';

const express = require('express');
const morgan = require('morgan');

const { PORT } = require('./config');
const notesRouter = require('./routers/notes.router');

// Create an Express application
const app = express();

// Log all requests. Skip logging during tests
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: () => process.env.NODE_ENV === 'test'
}));

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
// Add NODE_ENV check to prevent stacktrace leak
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: (process.env.NODE_ENV === 'development') ? err : {}
  });
});

// Promisify `listen` and resulting `server`
app.listenAsync = function (port) {
  return new Promise((resolve, reject) => {
    this.listen(port, function () {
      const util = require('util');
      this.closeAsync = util.promisify(this.close);
      resolve(this);
    }).on('error', reject);
  });
};

if (require.main === module) {
  app.listenAsync(PORT)
    .then(server => {
      console.info(`Server listening on ${server.address().port}`);
    })
    .catch(console.error);
}

module.exports = app; // Export for testing
