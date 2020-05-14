/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const { generateConfirmationCode } = require('../../api/utils/pseudo-number-generator');

chai.use(chaiHttp);

describe('Should handle pseudo generator', () => {
  it('should generate number', () => {
    const number = Number(generateConfirmationCode());
    number.should.gte(0);
  });

  it('should generate number', () => {
    const number = Number(generateConfirmationCode());
    number.should.lte(1000000000);
  });

  it('should generate number', () => {
    const number = Number(generateConfirmationCode());
    number.should.gt(-1);
  });
});
