'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const methodLoader = require('../');
const path = require('path');

lab.experiment('hapi-method-loader', () => {
  lab.test('will not crash if path does not exist', async() => {
    const server = new Hapi.Server({
      debug: {
        log: ['error', 'hapi-method-loader']
      },
      port: 3000
    });
    await server.register({
      plugin: methodLoader,
      options: {
        verbose: true,
        path: 'no/no/no/no/no/no/no/no/',
        prefix: 'test'
      },
    });
  });
});

lab.experiment('hapi-method-loader', () => {
  let server;

  lab.before( async() => {
    server = new Hapi.Server({
      debug: {
        log: ['error', 'hapi-method-loader']
      },
      port: 3000
    });
    await server.register({
      plugin: methodLoader,
      options: {
        verbose: true,
        path: `${__dirname}${path.sep}methods`,
        prefix: 'test'
      },
    });
  });

  lab.test(' loads as a plugin, auto-adds a method from a methods directory and lets you call it', async() => {
    await server.start();
    server.methods.test.doSomething(async (someEerr, result) => {
      Code.expect(typeof result).to.equal('string');
      Code.expect(result).to.equal('something');
      await server.stop();
    });
  });

  lab.test('loads as a plugin, lets you call a method added to a prefixed namespace correctly', async() => {
    await server.start();
    const result = server.methods.test.add(1, 1);
    Code.expect(typeof result).to.equal('number');
    Code.expect(result).to.equal(2);
    await server.stop();
  });
});

lab.experiment('hapi-method-loader cache', { timeout: 5000 }, async() => {
  let server;
  lab.before(async () => {
    server = new Hapi.Server({
      debug: {
        log: ['error', 'hapi-method-loader']
      },
      port: 3000
    });
    await server.register({
      plugin: methodLoader,
      options: {
        path: path.join(__dirname, 'cache')
      },
    });
  });
  lab.test('supports caching option from a method call', async () => {
    await server.start();
    server.methods.cacheIt((err1, result1) => {
      server.methods.cacheIt((err2, result2) => {
        setTimeout(() => {
          server.methods.cacheIt((err3, result3) => {
            Code.expect(result1).to.equal(result2);
            Code.expect(result2).to.not.equal(result3);
          });
        }, 3000);
      });
    });
  });
});
