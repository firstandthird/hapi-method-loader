const tap = require('tap');
const Hapi = require('hapi');
const methodLoader = require('../').methodLoader;
const path = require('path');

tap.test('loads as a module, auto-adds a method from a methods directory and lets you call it', async (t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  await methodLoader(server, {
    verbose: true,
    path: `${__dirname}${path.sep}methods`,
  });
  await server.start();
  const result = server.methods.doSomething();
  t.isA(result, 'string');
  t.equal(result, 'something');
  await server.stop();
});

tap.test('loads as a module, lets you call a method added to a prefixed namespace correctly', async (t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  await methodLoader(server, {
    path: `${__dirname}${path.sep}methods`,
    prefix: 'test'
  });
  await server.start();
  const result = server.methods.test.add(1, 1);
  t.isA(result, 'number');
  t.equal(result, 2);
  await server.stop();
});

tap.test('will try to load the "methods" folder by default', async(t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  await methodLoader(server, {
    verbose: true
  });
  await server.start();
  await server.stop();
});

tap.test('loads recursive modules', async(t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  await methodLoader(server, {
    path: `${__dirname}${path.sep}recursiveMethods`,
  });
  await server.start();
  const result = server.methods.chris.is.awesome();
  t.isA(result, 'string');
  t.equal(result, 'awesome');
  await server.stop();
});

tap.test('loads recursive modules with prefixed namespace', async(t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  await methodLoader(server, {
    path: `${__dirname}${path.sep}recursiveMethods`,
    prefix: 'seriously'
  });
  await server.start();
  const result = server.methods.seriously.chris.is.awesome();
  t.isA(result, 'string');
  t.equal(result, 'awesome');
  await server.stop();
});

tap.test('warns if a duplicate method is added', async (t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  let warningGiven = false;
  server.method('add', async () => {
    t.ok(warningGiven);
    await server.stop();
  });
  server.events.on('log', (evt) => {
    if (evt.data.message === 'method already exists') {
      warningGiven = true;
    }
  });
  await methodLoader(server, {
    verbose: true,
    path: `${__dirname}${path.sep}methods`,
  });
  server.methods.add();
});

tap.test('will load a relative path', async (t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  await methodLoader(server, {
    path: './test/methods'
  });
  await server.start();
  const result = server.methods.add(1, 1);
  t.isA(result, 'number');
  t.equal(result, 2);
  await server.stop();
});

tap.test('binds server', async (t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  await methodLoader(server, {
    path: './test/methods'
  });
  await server.start();
  const boundServer = await server.methods.server();
  t.isA(boundServer.plugins, 'object');
  await server.stop();
});

tap.test('will warn of an invalid method', async (t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  const results = [];
  server.log = (tags, data) => {
    results.push(tags);
    results.push(data);
  };
  await methodLoader(server, {
    path: './test/invalid'
  });
  t.equal(results.length, 2);
  t.match(results[1], 'add.js has invalid property "cache"');
});

tap.test('returns an error if the directory does not exist', async(t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  await methodLoader(server, { path: 'a nonexistent path' });
  t.end();
});

tap.test('will load "schema" and "description" metadata for hapi-docs', async(t) => {
  const server = new Hapi.Server({
    debug: {
      log: ['error', 'hapi-method-loader']
    },
    port: 3000
  });
  await methodLoader(server, {
    path: `${__dirname}${path.sep}methods`,
    verbose: true
  });
  await server.start();
  t.equal(server.methods.add.description, undefined);
  t.equal(server.methods.add.schema, undefined);
  t.equal(server.methods.doSomething.description, 'the description');
  t.equal(server.methods.doSomething.schema.isJoi, true);
  await server.stop();
});
