/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Sign handle movie controller', () => {
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/details/1')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/get-now-playing')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/details/11')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/detail/undefined')
      .end((err, res) => {
        res.should.have.status(404);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/recommendations')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/details/23')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/get-upcoming')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/get-upcoming')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/get-now-playing')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/get-now-playing')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/get-similar/12')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find movie', () => {
    chai.request(server)
      .get('/api/movies/recommendations')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
});
