const IPFS = require('ipfs')
const ipfsAPI = require('ipfs-api')
const fileToArrayBuffer = require('file-to-array-buffer')

var uploadedFile = undefined
var node

let uploadFileToIpfs = async function() {
  console.log("Uploading file to ipfs network....")

  let file = uploadedFile[0].files[0]
  console.log(file)
  let buff = await fileToArrayBuffer(file) 
  console.log(buff)
  const filesAdded = await node.files.add({
    path: 'file',
    content: Buffer.from(buff)
  })
  
  console.log(filesAdded)
  console.log('Added file:', filesAdded[0].path, filesAdded[0].hash)

  // Default port for IPFS api is 5002
  var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/4002')
  var ik = setInterval(_ => {
    ipfs.dht.findprovs(filesAdded, (err, peerInfos) => {
      node.stop()
      if (err) {
        // console.error("Error occured while finding peers : ", err)
        clearInterval(ik)
      } else {
        console.log("Peer info is : ", peerInfos)
      }

    })
  }, 100000)

  return filesAdded[0].hash
}

export default function(file, updateContract, args) {
  uploadedFile = file
  console.log("Initializing IPFS node for file upload")

  node = new IPFS({
    start: false,
    config: {
      Addresses: {
        Swarm: [
          // By default the node API runs on this port
          "/ip4/0.0.0.0/tcp/4002",
        ]
      }
    }
  })

  node.on('ready', async () => {
    console.log('Node is ready to use!')
    await node.start()

    const version = await node.version()
    console.log('Version:', version.version)

    let hash = await uploadFileToIpfs()
    updateContract(args, hash)
  })

  node.on('error', error => {
    console.error('Something went terribly wrong!', error)
  })

  node.on('start', _ => console.log('Node started!'))
  node.on('stop', _ => console.log("Node stopped"))
}
