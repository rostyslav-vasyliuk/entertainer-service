/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const { sendEmail } = require('../../api/utils/email');

describe('Should handle email sending', () => {
  it('should send email', () => {
    const res = sendEmail('', '', '');
  });

  it('should send email', () => {
    const res = sendEmail('a@gmail.com', '', '');
  });

  it('should send email', () => {
    const res = sendEmail('', 'subject', '');
  });
});
