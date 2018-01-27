'use strict';

const express = require('express');

const data = require('./db/notes');

// Create an Express application
const app = express();

// Create a static webserver
app.use(express.static('public'));

// Get All (and search by query)
app.get('/v1/notes', (req, res) => {
  const {searchTerm} = req.query;

  let list = searchTerm ? data.filter(item => item.title.includes(searchTerm)) : data;

  res.json(list);
});

// Get a single item
app.get('/v1/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = data.find(item => item.id === id);
  res.json(item);
});

// Listen for incoming connections
app.listen(8080, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});