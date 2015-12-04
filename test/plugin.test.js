var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Hapi = require('hapi');
var methodLoader = require("../")

lab.experiment('hapi-method-loader', function() {
  var server;
  var url = "mongodb://localhost:27017/apptics-api-test";
  lab.before(function(done) {
    server = new Hapi.Server({
      debug: {
        log: ['error', 'hapi-method-loader']
      }
    });
    server.connection({port:3000});
    server.register({
      register: methodLoader,
      options : {
        verbose: true,
        path : __dirname + "/methods",
        prefix: 'test'
      },
    }, function (err) {
      if (err) {
        console.log(err)
        return;
      }
      done();
    });
  });

  lab.test(' loads as a plugin, auto-adds a method from a methods directory and lets you call it', function(done){
    server.start(function(err){
      if (err) console.log(err)
      server.methods.test.doSomething(function(err, result) {
        Code.expect(typeof result).to.equal('string');
        Code.expect(result).to.equal('something');
        server.stop(function(err){
          done();
        })
      });
    });
  });

  lab.test('loads as a plugin, lets you call a method added to a prefixed namespace correctly', function(done){
    server.start(function(err){
      if (err) console.log(err)
      var result = server.methods.test.add(1,1);
      Code.expect(typeof result).to.equal('number');
      Code.expect(result).to.equal(2);
      server.stop(function(err){
        done();
      })
    });
  });
});
