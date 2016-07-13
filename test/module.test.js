'use strict';
const Code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const methodLoader = require('../').methodLoader;
const path = require('path');

lab.experiment('hapi-method-loader', () => {
  let server;
  lab.beforeEach((done) => {
    server = new Hapi.Server();
    server.connection();
    done();
  });
  lab.afterEach((done) => {
    server.stop(() => {
      done();
    });
  });
  lab.test('loads as a module, auto-adds a method from a methods directory and lets you call it', (done) => {
    methodLoader(server, {
      verbose: true,
      path: `${__dirname}${path.sep}methods`,
    },
    () => {
      server.start(() => {
        server.methods.doSomething((err, result) => {
          Code.expect(typeof result).to.equal('string');
          Code.expect(result).to.equal('something');
          done();
        });
      });
    });
  });
  lab.test('loads as a module, lets you call a method added to a prefixed namespace correctly', (done) => {
    methodLoader(server, {
      path: `${__dirname}${path.sep}methods`,
      prefix: 'test'
    },
    () => {
      server.start(() => {
        const result = server.methods.test.add(1, 1);
        Code.expect(typeof result).to.equal('number');
        Code.expect(result).to.equal(2);
        done();
      });
    });
  });
  lab.test('will try to load the "methods" folder by default', (done) => {
    methodLoader(server, {
      verbose: true
    },
    (err) => {
      server.start(() => {
        Code.expect(err).to.not.equal(undefined);
        Code.expect(err.path).to.include(`hapi-method-loader${path.sep}methods`);
        done();
      });
    });
  });
  lab.test('loads recursive modules', (done) => {
    methodLoader(server, {
      path: `${__dirname}${path.sep}recursiveMethods`,
    },
    () => {
      server.start(() => {
        const result = server.methods.chris.is.awesome();
        Code.expect(typeof result).to.equal('string');
        Code.expect(result).to.equal('awesome');
        done();
      });
    });
  });
  lab.test('loads recursive modules with prefixed namespace', (done) => {
    methodLoader(server, {
      path: `${__dirname}${path.sep}recursiveMethods`,
      prefix: 'seriously'
    },
    () => {
      server.start(() => {
        const result = server.methods.seriously.chris.is.awesome();
        Code.expect(typeof result).to.equal('string');
        Code.expect(result).to.equal('awesome');
        done();
      });
    });
  });
  lab.test('handles paths that are passed using the wrong delimiter', (done) => {
    let sep = '/';
    if (path.sep === '/') {
      sep = '\\';
    }
    methodLoader(server, {
      verbose: true,
      path: `${__dirname}${sep}methods`,
    },
    () => {
      server.start(() => {
        server.methods.doSomething((err, result) => {
          Code.expect(typeof result).to.equal('string');
          Code.expect(result).to.equal('something');
          done();
        });
      });
    });
  });
  lab.test('returns an error if the directory does not exist', (done) => {
    methodLoader(server, {
      path: 'a nonexistent path'
    },
    (err) => {
      Code.expect(err).to.not.equal(undefined);
      done();
    });
  });
  lab.test('warns if a duplicate method is added', (done) => {
    let warningGiven = false;
    server.method('add', () => {
      Code.expect(warningGiven).to.equal(true);
      return done();
    });
    server.on('log', (evt) => {
      if (evt.data.message === 'method already exists') {
        warningGiven = true;
      }
    });
    methodLoader(server, {
      verbose: true,
      path: `${__dirname}${path.sep}methods`,
    }, () => {
      server.methods.add();
    });
  });
  lab.test('will load a relative path', (done) => {
    methodLoader(server, {
      path: './test/methods'
    },
    () => {
      server.start(() => {
        const result = server.methods.add(1, 1);
        Code.expect(typeof result).to.equal('number');
        Code.expect(result).to.equal(2);
        done();
      });
    });
  });
});
