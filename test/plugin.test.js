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

  lab.test(' loads as a plugin, auto-adds a method from a methods directory and lets you call it', { timeout: 10000 }, async() => {
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
        path: `${__dirname}${path.sep}methods`,
        prefix: 'test'
      },
    });
    await server.start();
    server.methods.test.doSomething(async (someEerr, result) => {
      Code.expect(typeof result).to.equal('string');
      Code.expect(result).to.equal('something');
      await server.stop();
    });
  });

  lab.test('loads as a plugin, lets you call a method added to a prefixed namespace correctly', async() => {
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
        path: `${__dirname}${path.sep}methods`,
        prefix: 'test'
      },
    });
    await server.start();
    const result = server.methods.test.add(1, 1);
    Code.expect(typeof result).to.equal('number');
    Code.expect(result).to.equal(2);
    await server.stop();
  });
});

lab.experiment('hapi-method-loader cache', { timeout: 5000 }, async() => {
  lab.test('supports caching option from a method call', async () => {
    const server = new Hapi.Server({
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
    await server.start();
    const result1 = await server.methods.cacheIt();
    const result2 = await server.methods.cacheIt();
    // asyncify setTimeout to test cache expiration:
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    await wait(3000);
    const result3 = await server.methods.cacheIt();
    Code.expect(result1).to.equal(result2);
    Code.expect(result2).to.not.equal(result3);
  });
});
