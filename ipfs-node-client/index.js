const IPFS = require('ipfs')
const ipfsAPI = require('ipfs-api')


const node = new IPFS({
  start: false,
  config: {
    Addresses: {
      Swarm: [
        "/ip4/0.0.0.0/tcp/4002",
        "/ip4/127.0.0.1/tcp/4003/ws",
      ]
    }
  }
})

let addBlockToBlockChain = function(hash) {
  console.log("Adding ipfs link to blockchain : ", hash)
}

let uploadFileToIpfs = async function(node) {
  const filesAdded = await node.files.add({
    path: 'file',
    content: Buffer.from('Some super secret document')
  })
  
  console.log(filesAdded)
  console.log('Added file:', filesAdded[0].path, filesAdded[0].hash)

  // Default port for IPFS api is 5002
  var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/4002')
  var ik = setInterval(_ => {
    ipfs.dht.findprovs(filesAdded, (err, peerInfos) => {
      if (err) {
        // console.error("Error occured while finding peers : ", err)
        clearInterval(ik)
      } else {
        console.log("Peer info is : ", peerInfos)
      }

    })
  }, 1000)

  return filesAdded[0].hash
}

node.on('ready', async () => {
  console.log('Node is ready to use!')
  node.start()

  const version = await node.version()
  console.log('Version:', version.version)

  fileHash = uploadFileToIpfs(node)

  // Add the block into the blockchain here
  fileHash.then(hash => addBlockToBlockChain(hash))
})

node.on('error', error => {
  console.error('Something went terribly wrong!', error)
})

node.on('start', _ => console.log('Node started!'))
node.on('stop', _ => console.log("Node stopped"))