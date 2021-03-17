## hapi-method-loader   [![Build Status](https://travis-ci.org/firstandthird/hapi-method-loader.svg?branch=master)](https://travis-ci.org/firstandthird/hapi-method-loader)

A plugin that automatically loads [hapi](https://hapi.dev/) server methods for you. Never type `server.method(....)` again!

### Installation

`npm install hapi-method-loader`

### Usage

```js
server.register({
  register: require('hapi-method-loader'),
  options: {}
});
```

Will cause hapi to scan the _methods_ directory and import all the files it finds there as [server methods](https://hapi.dev/api/?v=20.1.0#-servermethods).

### Method Files

Each method should be a file in the _methods_ directory. Sub directories may be used for nested methods. File name will dictate method name.

Each file should export a _method_ function, which can take any parameters you want, return any value you want, and can be async or synchronous.  Optionally you can include an _options_ object which will be passed on to hapi's [server.method](https://hapi.dev/api/?v=20.1.0#-servermethodname-method-options) function.

Example Method File:

```js
module.exports = {
  method: function(name) {
    return `Hello ${name}!`;
  },
  options: {
    cache: {
      expiresIn: 60 * 60 * 1000
    },
    generateKey: function() {
      return 'getTimeExample';
    }
  }
};
```

Example Directory Layout:

```
-methods/
  -hello.js
  -world.js
  |-data/
    |-dump.js
    |-db/
      |- fetch.js
      |- put.js
```

Will result in the following server methods:
- _server.methods.hello()_
- _server.methods.world()_
- _server.methods.data.dump()_
- _server.methods.data.db.fetch()_
- _server.methods.data.db.put()_


## Plugin Options

The following options can be passed when the plugin is registered with hapi:

- _path_

  By default hapi-method-loader will look for your methods in a directory named _methods_ inside your current working directory (_process.cwd()_), but you can use _path_ to specify a different directory to scan for methods.

- _prefix_

  By default the loaded methods will be available at `server.methods.<methodName>`. But you can specify a _prefix_ and the plugin will make the functions available at `server.methods.<prefix>.<methodName>`.

- _verbose_

  When true, will print out information about each method that is loaded.
