var _ = require('lodash');
var fs = require('fs');

var defaults = {
  path: process.cwd() + '/methods',
  verbose: false,
  autoLoad: true
};

exports.register = function(server, options, next) {
  exports.methodLoader(server, options, next, true);
}

exports.register.attributes = {
  pkg: require('./package.json')
};
exports.methodLoader = function(server, options, next, useAsPlugin) {
  var settings = _.clone(options);
  settings = _.defaults(settings, defaults);

  var addMethod = function(folder, key, value, verbose) {
    key = _.camelCase(key);
    folder = (folder) ? _.camelCase(folder) : '';

    if ((folder && typeof server.methods[folder] != 'undefined' && typeof server.methods[folder][key] != 'undefined') || (!folder && typeof server.methods[key] !== 'undefined')) {
      server.log(['hapi-method-loader', 'error'], { message: 'method already exists', folder: folder, key: key });
      return;
    }

    key = (folder) ? folder+'.'+key : key;

    if (typeof value == 'function') {
      value = {
        method: value
      };
    }

    if (verbose) {
      server.log(['hapi-method-loader', 'debug'], { message: 'method loaded', name: key, options: value.options });
    }
    if (value.options) value.options.bind = server;
    else value.options = {bind:server};
    server.method(key, value.method, value.options);//
  };

  var load = function(options, next) {
    next = next || function() {};
    fs.stat(settings.path, function(err, stat) {
      if (err) {
        server.log(['hapi-method-loader', 'warning'], { message: err.message });
        return next();
      }

      if (!stat.isDirectory()) {
        server.log(['hapi-method-loader', 'warning'], { path: settings.path, message: 'Not a directory' });
        return next();
      }

      var methods = require('require-all')(settings.path);
      var isFolder = function(module){
        return (typeof module == 'object' && !module.method);
      }
      var addFile = function(file, fileName){
        if (options.prefix)
          addMethod(options.prefix, fileName, file, settings.verbose);
        else
          addMethod(false, fileName, file, settings.verbose);
      }
      var addFolder = function(folder, folderName){
        _.forIn(folder, function(module, methodName) {
          if (options.prefix)
            addMethod(options.prefix, methodName, module, settings.verbose);
          else
            addMethod(folderName, methodName, module, settings.verbose);
        });
      }
      _.forIn(methods, function(module, moduleName) {
        if (isFolder(module))
          addFolder(module, moduleName);
        else
          addFile(module,moduleName);
      });

      next();

    });
  };
  if (useAsPlugin){
    server.expose('load', load);
  }
  if (options.autoLoad === false) {
    return next();
  }
  load(options, next);
};
