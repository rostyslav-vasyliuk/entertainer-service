/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Validate user', () => {
  before(() => {
    sinon.stub(mongoose.Model, 'findById')
      .onFirstCall().throws({ message: 'Some error' })
      .onSecondCall().returns({ select: () => 'user' });
    sinon.stub(jwt, 'verify').returns({ id: {} });
  });

  after(() => {
    mongoose.Model.findById.restore();
    jwt.verify.restore();
  });

  it('Shold reject, token not found', () => {
    chai.request(server)
      .post('/api/auth/validate-user')
      .end((err, res) => {
        res.body.should.be.a('object');
      });
  });
  it('Should reject with some error', () => {
    chai.request(server)
      .post('/api/auth/validate-user')
      .set('access-token', 'tokken')
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.be.a('object');
      });
  });
});
