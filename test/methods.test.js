var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Hapi = require('hapi');

lab.experiment('hapi-method-loader', function() {
  var server;
  lab.before(function(done) {
    server = new Hapi.Server();
    server.connection();
    var url = "mongodb://localhost:27017/apptics-api-test";
    done();
  });

  // lab.test('lets you call a method added to a prefixed namespace correctly', function(done){
  lab.test(' auto-adds a method from the methods directory and lets you call it', function(done){
    server.start(function(err){
      console.log(err)
      server.methods.doSomething(function(err, result) {
        console.log(err)
        console.log(result)
        Code.expect(typeof result).to.equal('string');
        Code.expect(typeof result).to.equal('something');
        done();
      });
    });
  });
});
