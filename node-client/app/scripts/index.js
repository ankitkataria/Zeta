import '../styles/app.css'

import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

import filesArtifact from '../../build/contracts/Files.json'

const Files = contract(filesArtifact)

let accounts
let account

const App = {
  start: function () {
    const self = this

    Files.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]
      $('#account-address').html(account)
      self.refreshBalance()
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  refreshBalance: function () {
    web3.eth.getBalance(account, function (err, balance) {
      $('#account-balance').html(web3.fromWei(balance.toNumber(), 'ether'))

      if (err) {
        console.log(err)
      }
    })
  },

  uploadFile: function (e) {
    var self = this
    var filePath = 'tu dekh liyo'

    Files.deployed().then(function (instance) {
      instance.addPublicDocument(filePath, { from: account, gas: 140000 })
      self.refreshBalance()
    })
  }
}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn('Using web3 detected from external source.')
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn('No web3 detected. Falling back to http://127.0.0.1:9545.')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
  }

  App.start()
})
