const methodLoader = require('./lib/methodLoader');

const register = async(server, options) => {
  await methodLoader(server, options, true);
};

module.exports.methodLoader = methodLoader;

exports.plugin = {
  register,
  once: true,
  name: 'hapi-method-loader',
  pkg: require('./package.json')
};
