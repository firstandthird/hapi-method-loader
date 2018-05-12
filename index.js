'use strict';
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const reqDir = require('directory-files');
const util = require('util');

const defaults = {
  path: `${process.cwd()}${path.sep}methods`,
  verbose: false,
  autoLoad: true
};

const register = async (server, options) => {
  await exports.methodLoader(server, options, true);
};

exports.methodLoader = async function(server, options, useAsPlugin) {
  const loadMethodFromFile = (file) => {
    try {
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
    } catch (err) {
      server.log(['hapi-method-loader', 'warning'], { path: file, message: 'Error loading' });
      return {};
    }
  };

  const load = (passedOptions, loadDone) => {
    const settings = _.defaults(passedOptions, defaults);
    settings.path = path.normalize(path.resolve(settings.path));
    // make sure the path exists and is loadable:
    try {
      const exists = fs.existsSync(settings.path);
      if (!exists) {
        server.log(['hapi-method-loader', 'warning'], { path: settings.path, message: 'Directory does not exist' });
        return loadDone();
      }
      const stat = fs.statSync(settings.path);
      if (!stat || !stat.isDirectory) {
        server.log(['hapi-method-loader', 'warning'], { path: settings.path, message: 'Not a directory' });
        return loadDone('Not a directory');
      }
    } catch (err) {
      server.log(['hapi-method-loader', 'warning'], { message: err.message });
      return loadDone(err);
    }
    // get all files (at any level) underneath the methods directory:
    reqDir(settings.path).then((hash) => {
      // go through each file, parse it and add it, abort if anything goes awry:
      for (let i = 0; i < hash.length; i++) {
        const file = hash[i];
        // get an array containing the elements of the module:
        // const relativePathSegments = _.difference(file.split(path.sep), settings.path.split(path.sep));
        const allPathComponents = file.split(path.sep);
        const relativePathSegments = allPathComponents.slice(settings.path.split(path.sep).length, allPathComponents.length);
        let key;
        // if it's in the root methods folder:
        if (relativePathSegments.length === 1) {
          // get the method's name to use as a key in server.methods:
          key = _.camelCase(path.basename(relativePathSegments[0], path.extname(relativePathSegments[0])));
          key = settings.prefix ? `${settings.prefix}.${key}` : key;
        } else {
          // get the method's name (including the path) as a key in server.methods:
          const lastIndex = relativePathSegments.length - 1;
          relativePathSegments[lastIndex] = path.basename(relativePathSegments[lastIndex], path.extname(relativePathSegments[lastIndex]));
          _.each(relativePathSegments, (item, n) => {
            relativePathSegments[n] = _.camelCase(item);
          });
          key = relativePathSegments.join('.');
          key = settings.prefix ? `${settings.prefix}.${key}` : key;
        }
        // finally, add the function to the server:
        if (!_.get(server.methods, key)) {
          // load the executable:
          const method = loadMethodFromFile(file);
          // validate fields:
          Object.keys(method).forEach((propName) => {
            if (['options', 'method', 'description', 'schema'].indexOf(propName) < 0) {
              server.log(['hapi-method-loader', 'error'], `Method imported from ${file} has invalid property "${propName}" `);
            }
          });
          if (settings.verbose) {
            server.log(['hapi-method-loader', 'debug'], { message: 'method loaded', name: key });
          }
          if (method.method) {
            server.method(key, method.method, method.options);
            const registeredMethod = _.get(server.methods, key);
            if (method.description) {
              registeredMethod.description = method.description;
            }
            if (method.schema) {
              registeredMethod.schema = method.schema;
            }
          }
        } else {
          server.log(['hapi-method-loader', 'error'], { message: 'method already exists', key });
        }
      }
      return loadDone();
    });
  };

  const promiseLoad = util.promisify(load);
  if (useAsPlugin) {
    server.expose('load', promiseLoad);
  }
  if (options.autoLoad === false) {
    return next();
  }
  await promiseLoad(options);
};

exports.plugin = {
  register,
  once: true,
  pkg: require('./package.json')
};
