'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const methodLoader = require('../').methodLoader;
const path = require('path');

lab.experiment('hapi-method-loader', () => {
  lab.test('loads as a module, auto-adds a method from a methods directory and lets you call it', { timeout: 5000 }, async () => {
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
    Code.expect(typeof result).to.equal('string');
    Code.expect(result).to.equal('something');
    await server.stop();
  });

  lab.test('loads as a module, lets you call a method added to a prefixed namespace correctly', { timeout: 5000 }, async () => {
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
    Code.expect(typeof result).to.equal('number');
    Code.expect(result).to.equal(2);
    await server.stop();
  });

  lab.test('will try to load the "methods" folder by default', { timeout: 5000 }, async() => {
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

  lab.test('loads recursive modules', { timeout: 5000 }, async() => {
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
    Code.expect(typeof result).to.equal('string');
    Code.expect(result).to.equal('awesome');
    await server.stop();
  });

  lab.test('loads recursive modules with prefixed namespace', async() => {
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
    Code.expect(typeof result).to.equal('string');
    Code.expect(result).to.equal('awesome');
    await server.stop();
  });

  lab.test('warns if a duplicate method is added', async () => {
    const server = new Hapi.Server({
      debug: {
        log: ['error', 'hapi-method-loader']
      },
      port: 3000
    });
    let warningGiven = false;
    server.method('add', async () => {
      Code.expect(warningGiven).to.equal(true);
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

  lab.test('will load a relative path', async () => {
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
    Code.expect(typeof result).to.equal('number');
    Code.expect(result).to.equal(2);
    await server.stop();
  });

  lab.test('binds server', async () => {
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
    Code.expect(typeof boundServer.plugins).to.equal('object');
    await server.stop();
  });

  lab.test('will warn of an invalid method', async () => {
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
    Code.expect(results.length).to.equal(2);
    Code.expect(results[1]).to.include('add.js has invalid property "cache"');
  });

  lab.test('keeps on going when a method file fails to load', async () => {
    const server = new Hapi.Server({
      debug: {
        log: ['error', 'hapi-method-loader']
      },
      port: 3000
    });
    await methodLoader(server, { path: 'test/error' });
    Code.expect(typeof server.methods.b).to.equal('function');
    Code.expect(typeof server.methods.a).to.equal('undefined');
  });

  lab.test('returns an error if the directory does not exist', async() => {
    const server = new Hapi.Server({
      debug: {
        log: ['error', 'hapi-method-loader']
      },
      port: 3000
    });
    try {
      await methodLoader(server, { path: 'a nonexistent path' });
      Code.expect(true).to.not.equal(true);
    } catch (err) {
      Code.expect(err).to.not.equal(undefined);
    }
  });

  lab.test('will load "schema" and "description" metadata for hapi-docs', { timeout: 5000 }, async() => {
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
    Code.expect(server.methods.add.description).to.equal(undefined);
    Code.expect(server.methods.add.schema).to.equal(undefined);
    Code.expect(server.methods.doSomething.description).to.equal('the description');
    Code.expect(server.methods.doSomething.schema.isJoi).to.equal(true);
    await server.stop();
  });
});
