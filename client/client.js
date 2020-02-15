const request = require('request-promise-native')

class Potemkin {
  constructor() {

  }

  async setPatterns(patterns) {
    return new Promise((resolve, reject) => {

      request('http://localhost:1774/api/patterns', {
        method: 'POST',
        json: patterns
      },
        async (err, response, body) => {
          if (err) {
            reject();
          } else {
            resolve();
          }
        }
      );
    });
  }
}

module.exports = Potemkin;
