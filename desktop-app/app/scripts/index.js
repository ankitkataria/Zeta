import '../styles/app.css'

import $ from 'jquery'
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import uploadFile from './ipfs_upload'
require('abortcontroller-polyfill/dist/polyfill-patch-fetch')

import filesArtifact from '../../build/contracts/Files.json'

const Files = contract(filesArtifact)
const queryServer = 'http://localhost:5000/'

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
      self.getFiles()
    })

    // to update votes of all public files
    Files.deployed().then(function (instance) {
      instance.getPublicSharesListCount().then(function (count) {
        let i
        for (i = 0; i < count; i++) {
          self.updateVotes(i)
        }
      })
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
    var state = this
    var file = $('#doc-upload')

    let updateContract = function (state, hash) {
      console.log('Inside update contract function')
      Files.deployed().then(function (instance) {
        let filePath = `https://ipfs.io/ipfs/${hash}`
        instance.addPublicDocument(filePath, { from: account, gas: 6000000 })
        state.refreshBalance()
      })
    }

    uploadFile(file, updateContract, state)
  },

  encryptWithPublicKey: function (filePath, journalistKey) {
    // encryting the  file path using the
    // the journalistKey as the private key
  },

  uploadPrivateFile: function (e) {
    var state = this
    var file = $('#private-doc')
    var journalistKey = $('#journalists-options option:select').val()

    let updateContract = function (state, hash) {
      console.log('Inside update contract function')
      Files.deployed().then(function (instance) {
        let filePath = `https://ipfs.io/ipfs/${hash}`
        instance.addDocument(state.encryptWithPublicKey(filePath, journalistKey), { from: account, gas: 6000000 })
        state.refreshBalance()
      })
    }

    uploadFile(file, updateContract, state)
  },

  getFiles: function () {
    Files.deployed().then(function (instance) {
      let fileCount
      let fileInfoHtml = ''

      instance.getPublicSharesListCount().then(function (res) {
        fileCount = res

        let fileInfo = []

        let i
        for (i = 0; i < fileCount; i++) {
          instance.getPublicShareInfo(i).then(function (file) {
            fileInfo.push(file)
            fileInfoHtml += `<li class="file"> \
 <a class="file-url-${file[0]}" href="${file[1]}"> ${file[1]} </a> \
<button class="up-vote-${file[0]}-btn" onclick="App.vote(${file[0]}, 1)"> Up </button> \
<span id="upvotes-${file[0]}">  ${file[2].toNumber()} </span> \
<button class="down-vote-${file[0]}-btn" onclick="App.vote(${file[0]}, -1)"> Down </button> \
<span id="downvotes-${file[0]}"> ${file[3].toNumber()} </span> </li>`
            $('#public-shares').html(fileInfoHtml)
          })
        }
      })
    })
  },

  getPrivateFiles: function () {
    Files.deployed().then(function (instance) {
      let fileCount
      let fileInfoHtml = ''

      instance.getPrivateSharesCount(account).then(function (res) {
        fileCount = res

        let i
        for (i = 0; i < fileCount; i++) {
          instance.getPrivateSharesInfo(account, i).then(function (file) {
            fileInfoHtml += `<li class="file"> \
 <a class="file-url-${file[0]}" href="#"> ${file[0]} </a> \
<button class="show-encrypted-${file[0]}-btn" onclick="App.showEncrypted(${file[0]})"> Show </button> \
<span id="decrpted-${file[0]}"> </span> </li>`
          })
          $('#my-private-shares').html(fileInfoHtml)
        }
      })
    })
  },

  showEncrypted: function (url) {
    // decrypt the url using the private key of the journalist 
    let decryptedURL

    $(`.file-url-${url}`).html(decryptedURL)
    $(`.file-url-${url}`).attr('href', decryptedURL)
  },

  vote: function (id, change) {
    let self = this
    Files.deployed().then(function (instance) {
      instance.vote(id, change, { from: account, gas: 1400000 }).then(function (votes) {
        self.updateVotes(id)
      })
    })
  },

  updateVotes: function (id) {
    Files.deployed().then(function (instance) {
      instance.getVotes(id).then(function (votes) {
        $('#upvotes-' + id).html(votes[0].toNumber())
        $('#downvotes-' + id).html(votes[1].toNumber())
      })
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
    console.warn('No web3 detected. Falling back to http://127.0.0.1:7545.')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
  }

  App.start()
})
