/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const server = require('../../../index');

chai.use(chaiHttp);

const should = chai.should();

describe('Sign Up', () => {
  const userData = {
    firstname: 'fn',
    lastname: 'ln',
    email: 'a@a.com',
    password: '1111',
    gender: 'Male',
    birthdate: 'Apr 27, 1987',
    country: 'Ukraine',
    countryCode: 'UA'
  };
  let userFind;

  before(() => {
    userFind = sinon.stub(mongoose.Model, 'findOne');
    sinon.stub(mongoose.Model.prototype, 'save');
  });

  after(() => {
    userFind.restore();
    mongoose.Model.prototype.save.restore();
  });

  it('Shold reject, validation error', () => {
    chai.request(server)
      .post('/api/auth/sign-up')
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Please, fill up all fields!');
      });
  });
  it('Shold reject, validation error', () => {
    chai.request(server)
      .post('/api/auth/sign-up')
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Please, fill up all fields!');
      });
  });
  it('Shold reject, fill up all fields', () => {
    chai.request(server)
      .post('/api/auth/sign-up')
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Please, fill up all fields!');
      });
  });
  it('Shold reject, fill up all fields', () => {
    chai.request(server)
      .post('/api/auth/sign-up')
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Please, fill up all fields!');
      });
  });
  it('Shold reject, fill up all fields', () => {
    chai.request(server)
      .post('/api/auth/sign-up')
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Please, fill up all fields!');
      });
  });
  it('Shold reject, fill up all fields', () => {
    chai.request(server)
      .post('/api/auth/sign-up')
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('Please, fill up all fields!');
      });
  });
  it('Should reject, username is already exist', () => {
    userFind.returns({});
    chai.request(server)
      .post('/api/auth/sign-up')
      .send(userData)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('User with this email is already exist!');
      });
  });
  it('Should sign up user', () => {
    userFind.returns();
    chai.request(server)
      .post('/api/auth/sign-up')
      .send(userData)
      .end((err, res) => {
        res.should.have.status(200);
      });
  });
  it('Should reject, email is already exist', () => {
    userFind
      .returns({})
      .onSecondCall().returns();
    chai.request(server)
      .post('/api/auth/sign-up')
      .send(userData)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.eql('User with this email is already exist!');
      });
  });
});
