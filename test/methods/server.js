module.exports = {
  method: function(next) {
    return next(null, this);
  }
};
