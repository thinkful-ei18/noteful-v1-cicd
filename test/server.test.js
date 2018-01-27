'use strict';

/**
 * DISCLAIMER:
 * The examples shown below are superficial tests which only check the API responses.
 * They do not verify the responses against the data in the database. We will learn
 * how to crosscheck the API responses against the database in a later exercise.
 */
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');

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

const expect = chai.expect;

chai.use(chaiHttp);
chai.use(chaiSpies);

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});

describe('Environment setup', function () {

  it('NODE_ENV should be "test"', function () {
    expect(process.env.NODE_ENV).to.equal('test');
  });

  it('Express App should have correct methods', function () {
    expect(app).to.have.property('listenAsync');
  });

});

describe('Noteful App', function () {

  // define server at higher scope so it is available to chai.request()
  let server; 

  before(function () {
    console.log('Before: start express app');
    
    return app.listenAsync()
      .then(instance => server = instance); // set server instance
  });

  after(function () {
    console.log('After: close server');
    return server.closeAsync();
  });

  describe('Express static', function () {

    it('GET request "/" should return the index page', function () {
      return chai.request(server)
        .get('/')
        .then(function (res) {
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });

  });

  describe('404 handler', function () {

    it('should respond with 404 when given a bad path', function () {
      const spy = chai.spy();
      return chai.request(server)
        .get('/bad/path')
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          expect(err.response).to.have.status(404);
        });
    });

  });

  describe('GET /v1/notes', function () {

    it('should return the default of 10 Notes ', function () {
      return chai.request(server)
        .get('/v1/notes')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(10);
        });
    });

    it('should return a list with the correct right fields', function () {
      return chai.request(server)
        .get('/v1/notes')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(10);
          res.body.forEach(function (item) {
            expect(item).to.be.a('object');
            expect(item).to.include.keys('id', 'title', 'content');
          });
        });
    });

    it('should return correct search results for a valid query', function () {
      return chai.request(server)
        .get('/v1/notes?searchTerm=5%20life')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.be.an('object');
          expect(res.body[0].id).to.equal(1000);
        });
    });

    it('should return an empty array for an incorrect query', function () {
      return chai.request(server)
        .get('/v1/notes?searchTerm=Not%20a%20Valid%20Search')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(0);
        });
    });

  });

  describe('GET /v1/notes/:id', function () {

    it('should return correct notes', function () {
      return chai.request(server)
        .get('/v1/notes/1000')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');
          expect(res.body.id).to.equal(1000);
          expect(res.body.title).to.equal('5 life lessons learned from cats');
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      const spy = chai.spy();
      return chai.request(server)
        .get('/v1/notes/9999')
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          expect(err.response).to.have.status(404);
        });
    });

  });

  describe('POST /v1/notes', function () {

    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };
      return chai.request(server)
        .post('/v1/notes')
        .send(newItem)
        .then(function (res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content');

          expect(res.body.id).to.equal(1010);
          expect(res.body.title).to.equal(newItem.title);
          expect(res.body.content).to.equal(newItem.content);
          expect(res).to.have.header('location');
        });
    });

    it('should return an error when missing "title" field', function () {
      const newItem = {
        'foo': 'bar'
      };
      const spy = chai.spy();
      return chai.request(server)
        .post('/v1/notes')
        .send(newItem)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch((err) => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

  });

  describe('PUT /v1/notes/:id', function () {

    it('should update the note', function () {
      const updateItem = {
        'title': 'What about dogs?!',
        'content': 'woof woof'
      };
      return chai.request(server)
        .put('/v1/notes/1005')
        .send(updateItem)
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content');

          expect(res.body.id).to.equal(1005);
          expect(res.body.title).to.equal(updateItem.title);
          expect(res.body.content).to.equal(updateItem.content);
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      const updateItem = {
        'title': 'What about dogs?!',
        'content': 'woof woof'
      };
      const spy = chai.spy();
      return chai.request(server)
        .put('/v1/notes/9999')
        .send(updateItem)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          expect(err.response).to.have.status(404);
        });
    });

    it('should return an error when missing "title" field', function () {
      const updateItem = {
        'foo': 'bar'
      };
      const spy = chai.spy();
      return chai.request(server)
        .put('/v1/notes/9999')
        .send(updateItem)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

  });

  describe('DELETE  /v1/notes/:id', function () {

    it('should delete an item by id', function () {
      return chai.request(server)
        .delete('/v1/notes/1005')
        .then(function (res) {
          expect(res).to.have.status(204);
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      const spy = chai.spy();
      return chai.request(server)
        .delete('/v1/notes/9999')
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          expect(err.response).to.have.status(404);
        });
    });

  });

});
