module.exports = (server, options, file) => {
  let value = require(file);
  if (typeof value === 'function') {
    value = {
      method: value
    };
  }
  if (value.options && typeof value.options.cache === 'function') {
    value.options = value.options || {};
    value.options.cache = value.options.cache(server, options);
  }

  if (value.options) {
    value.options.bind = server;
  } else {
    value.options = { bind: server };
  }
  return value;
};
