const path = require('path');
const _ = require('lodash');

const defaults = {
  path: `${process.cwd()}${path.sep}methods`,
  verbose: false
};

const register = async(server, options) => {
  const load = require('./lib/load').bind(server);
  const settings = _.defaults(options, defaults);
  await load(settings);
};

exports.plugin = {
  register,
  once: true,
  name: 'hapi-method-loader',
  pkg: require('./package.json')
};
