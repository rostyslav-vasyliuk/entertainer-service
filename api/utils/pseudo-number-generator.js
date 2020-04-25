const MIN_NUMBER = 0;
const MAX_NUMBER = 9;
const CODE_LENGTH = 6;

const randomIntInc = (low, high) => {
  return Math.floor(Math.random() * (high - low + 1) + low)
}

const generateConfirmationCode = () => {

  let confirmationCode = '';
  
  for (let i = 0; i < CODE_LENGTH; i++) {
    confirmationCode += String(randomIntInc(MIN_NUMBER, MAX_NUMBER));
  }

  console.log(confirmationCode);
  return confirmationCode;
}

module.exports = {
  generateConfirmationCode
}
