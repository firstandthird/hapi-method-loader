const path = require('path');
const _ = require('lodash');
const util = require('util');

const defaults = {
  path: `${process.cwd()}${path.sep}methods`,
  verbose: false,
  autoLoad: true
};

module.exports = async (server, options, useAsPlugin) => {
  const load = require('./load').bind(server);
  const settings = _.defaults(options, defaults);
  await load(options);
};
