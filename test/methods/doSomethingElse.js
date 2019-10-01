const joi = require('@hapi/joi');
const func = function() {
  return 'something';
};
func.description = 'the description';
func.schema = joi.object().keys({
  username: joi.string(),
  number: joi.number()
});

module.exports = func;
