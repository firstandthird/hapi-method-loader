const joi = require('@hapi/joi');
module.exports = {
  method: function() {
    return 'something';
  },
  description: 'the description',
  schema: joi.object().keys({
    username: joi.string(),
    number: joi.number()
  })
};
