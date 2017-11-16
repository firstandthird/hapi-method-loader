module.exports = {
  method: function() {
    // 'this' should be server but appears to be server.plugins:
    console.log('this should be the server:')
    console.log(this);
    return this;
  }
};
