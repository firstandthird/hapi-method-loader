const tap = require('tap');
const Hapi = require('hapi');
const methodLoader = require('../');
const path = require('path');

tap.test('will not crash if path does not exist', async(t) => {
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

tap.test(' loads as a plugin, auto-adds a method from a methods directory and lets you call it', async(t) => {
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
  const result = await server.methods.test.doSomething();
  t.isA(result, 'string');
  t.equal(result, 'something');
  await server.stop();
});

tap.test('loads as a plugin, lets you call a method added to a prefixed namespace correctly', async(t) => {
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
  t.isA(result, 'number');
  t.equal(result, 2);
  await server.stop();
});

tap.test('supports caching option from a method call', async (t) => {
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
  t.equal(result1, result2);
  t.notEqual(result2, result3);
  await server.stop();
});
