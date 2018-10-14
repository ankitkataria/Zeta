// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    ganache: {
      host: '139.59.10.216',
      port: 7545,
      network_id: '*' // Match any network id
    }
  }
}
