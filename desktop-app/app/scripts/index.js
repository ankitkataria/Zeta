import $ from 'jquery'
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import uploadFile from './ipfs_upload'
require('abortcontroller-polyfill/dist/polyfill-patch-fetch')

import filesArtifact from '../../build/contracts/Files.json'

const Files = contract(filesArtifact)

let accounts
let account

let cryptWorker = new Worker('cryptoWorker.js')
this.getWebWorkerResponse('set-private', currentWindow.custom.keys.privKey)

const currentWindow = window.require('electron').remote.getCurrentWindow();

function truncate(str, length) {
  return `${str.slice(0,length)}...`
}

String.prototype.hashCode = function(){
   if (Array.prototype.reduce){
       return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
   }
   var hash = 0;
   if (this.length === 0) return hash;
   for (var i = 0; i < this.length; i++) {
       var character  = this.charCodeAt(i);
       hash  = ((hash<<5)-hash)+character;
       hash = hash & hash; // Convert to 32bit integer
   }
   return hash;
}

function getWebWorkerResponse (messageType, messagePayload) {
  return new Promise((resolve, reject) => {
    const messageId = Math.floor(Math.random() * 100000)
    cryptWorker.postMessage([messageType, messageId].concat(messagePayload))
    const handler = function (e) {
      if (e.data[0] === messageId) {
        e.currentTarget.removeEventListener(e.type, handler)
        resolve(e.data[1])
      }
    }
    cryptWorker.addEventListener('message', handler)
  })
}

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
      $('#account-address').html(truncate(account, 25))
      self.refreshBalance()
      self.getFiles()
    })

    // to update votes of all public files
    self.updateAllVotes()
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
          .then(_ => state.refreshBalance())
      })
    }

    uploadFile(file, updateContract, state)
  },

  encryptWithPublicKey: async function (filePath, journalistKey) {
    let encData = await getWebWorkerResponse('encrypt', [filePath, journalistKey])
    return encData
    // encryting the  file path using the
    // the journalistKey as the private key
  },

  uploadPrivateFile: function (e) {
    var state = this
    var file = $('#private-doc')
    var journalistKey = $('#journalists-options').find(':selected').text()

    let updateContract = function (state, hash) {
      console.log('Inside update contract function')

      Files.deployed().then(async function (instance) {
        let filePath = `https://ipfs.io/ipfs/${hash}`
        let encryptedData = await state.encryptWithPublicKey(filePath, journalistKey)

        instance.addDocument(encryptedData, journalistKey.hashCode(), { from: account, gas: 6000000 })
        state.refreshBalance()
      })

    }

    uploadFile(file, updateContract, state)
  },

  getFiles: function () {
    console.log("Getting files")
    Files.deployed().then(function (instance) {
      let fileCount
      let fileInfoHtml = ''

      instance.getPublicSharesListCount().then(function (res) {
        console.log("File count", res)
        fileCount = res

        let fileInfo = []

        let i
        for (i = 0; i < fileCount; i++) {
          instance.getPublicShareInfo(i).then(function (file) {
            console.log(file)
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

      instance.getPrivateSharesCount(currentWindow.custom.keys.pubKey.hashCode()).then(function (res) {
        fileCount = res

        let i
        for (i = 0; i < fileCount; i++) {
          instance.getPrivateSharesInfo(currentWindow.custom.keys.pubKey.hashCode(), i).then(function (file) {
            fileInfoHtml += `<li class="file"> \
 <a class="file-url-${file[0]}" href="#"> ${file[0]} </a> \
<button class="show-encrypted-${file[0]}-btn" onclick="App.showEncrypted(${file[0]})"> Show </button> \
<span id="decrpted-${file[0]}"> </span> </li>`
            $('#my-private-shares').html(fileInfoHtml)
          })
        }
      })
    })
  },

  decryptWithPrivateKey: async function (filePath) {
    let decData = await getWebWorkerResponse('decrypt', filePath)
    return decData
  },

  showEncrypted: async function (url) {
    let self = this
    // decrypt the url using the private key of the journalist

    let decryptedURL = await self.decryptWithPrivateKey(url)

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
    let self = this
    Files.deployed().then(function (instance) {
      instance.getVotes(id).then(function (votes) {
        $('#upvotes-' + id).html(votes[0].toNumber())
        $('#downvotes-' + id).html(votes[1].toNumber())

        self.refreshBalance()
      })
    })
  },

  updateAllVotes: function() {
    let self = this

    Files.deployed().then(function (instance) {
      instance.getPublicSharesListCount().then(function (count) {
        let i
        for (i = 0; i < count; i++) {
          self.updateVotes(i)
        }
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
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://139.59.10.216:7545'))
  }

  App.start()
})
