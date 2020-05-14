/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Sign handle serie controller', () => {
  it('Should find serie', () => {
    chai.request(server)
      .get('/api/tv-series/details/1')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find serie', () => {
    chai.request(server)
      .get('/api/tv-series/details/11')
      .set('access-token', 'token')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find serie', () => {
    chai.request(server)
      .get('/api/tv-series/detail/undefined')
      .end((err, res) => {
        res.should.have.status(404);
      });
  });
  it('Should find serie', () => {
    chai.request(server)
      .get('/api/tv-series/details/23')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find serie', () => {
    chai.request(server)
      .get('/api/tv-series/detail/null')
      .end((err, res) => {
        res.should.have.status(404);
      });
  });
  it('Should find serie', () => {
    chai.request(server)
      .get('/api/tv-series/details/233')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find serie', () => {
    chai.request(server)
      .get('/api/tv-series/get-top-ten')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should find serie', () => {
    chai.request(server)
      .get('/api/tv-series/get-top-ten')
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
});
