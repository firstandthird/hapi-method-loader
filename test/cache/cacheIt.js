
module.exports = {
  method() {
    return new Date().toString();
  },
  options: {
    cache: (server, pluginOptions) => {
      return {
        expiresIn: 1000,
        generateTimeout: 500
      };
    }
  }
};
