'use strict';
const Hapi = require('hapi');
const path = require('path');

const run = async () => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  try {
    await server.register({
      plugin: require('../'),
      options: {
        path: path.join(__dirname, 'methods'),
        verbose: true,
        prefix: 'test'
      }
    });
    await server.start();
    console.log('Server running at:', server.info.uri);
    server.methods.test.doSomething((doSomethingErr, result) => {
      console.log('method result', result);
    });
  } catch (e) {
    console.log(e)
  }
};

run();
