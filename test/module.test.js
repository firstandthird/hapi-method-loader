var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Hapi = require('hapi');
var methodLoader = require("../").methodLoader

lab.experiment('hapi-method-loader', function() {
  var server;
  lab.before(function(done) {
    server = new Hapi.Server();
    server.connection();
    var url = "mongodb://localhost:27017/apptics-api-test";
    done();
  });

  lab.test('loads as a module, auto-adds a method from a methods directory and lets you call it', function(done){
    methodLoader(server, {
      verbose : true,
      path : __dirname + "/methods"
    },
    function(result){
      server.start(function(err){
        server.methods.doSomething(function(err, result) {
          Code.expect(typeof result).to.equal('string');
          Code.expect(result).to.equal('something');
          done();
        });
      });
    })
  });

  lab.test('loads as a module, lets you call a method added to a prefixed namespace correctly', function(done){
    methodLoader(server, {
      path : __dirname + "/methods",
      prefix : "test"
    },
    function(result){
      server.start(function(err){
        var result = server.methods.test.add(1,1);
        Code.expect(typeof result).to.equal('number');
        Code.expect(result).to.equal(2);
        done();
      });
    })
  });
});
