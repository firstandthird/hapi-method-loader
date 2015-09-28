var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({ port: 3000 });

server.register({
  register: require('../')
}, function (err) {
  if (err) {
    console.error('Failed to load a plugin:', err);
    return;
  }

  server.start(function() {
    server.methods.doSomething(function(err, result) {
      console.log('method result', result);
    });
    
    console.log('Server running at:', server.info.uri);
  });
});
