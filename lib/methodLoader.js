const path = require('path');
const _ = require('lodash');

const defaults = {
  path: `${process.cwd()}${path.sep}methods`,
  verbose: false
};

module.exports = async (server, options) => {
  const load = require('./load').bind(server);
  const settings = _.defaults(options, defaults);
  await load(settings);
};
