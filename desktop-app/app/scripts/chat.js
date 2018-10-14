const vm = new Vue ({
  el: '#vue-instance',
  data () {
    return {
      cryptWorker: null,
      socket: null,
      originPublicKey: null,
      destinationPublicKey: null,
      messages: [],
      notifications: [],
      currentRoom: null,
      pendingRoom: null,
      draft: ''
    }
  },
  async created () {
    this.addNotification('Generating a new keypair...')
    this.cryptWorker = new Worker('cryptoWorker.js')
    this.originPublicKey = await this.getWebWorkerResponse('generate-keys')
    this.addNotification(`Keypair Generated - ${this.getKeySnippet(this.originPublicKey)}`)
    this.pendingRoom = this.originPublicKey
    this.socket = io()
    this.setupSocketListeners()
  },
  methods: {
    setupSocketListeners () {
      this.socket.on('connect', () => {
        this.addNotification('Connected To Server.')
        this.joinRoom()
      })
      this.socket.on('disconnect', () => this.addNotification('Lost Connection'))
      this.socket.on('MESSAGE', async (message) => {
        if (message.recipient === this.originPublicKey) {
          message.text = await this.getWebWorkerResponse('decrypt', message.text)
          this.messages.push(message)
        }
      })
      this.socket.on('NEW_CONNECTION', () => {
        this.addNotification('Another user joined the room.')
        this.sendPublicKey()
      })
      this.socket.on('ROOM_JOINED', (newRoom) => {
        this.currentRoom = newRoom
        console.log(newRoom)
        this.addNotification(`Joined Room - ${this.currentRoom}`)
        this.sendPublicKey()
      })
      this.socket.on('PUBLIC_KEY', (key) => {
        this.addNotification(`Public Key Received - ${this.getKeySnippet(key)}`)
        this.destinationPublicKey = key
      })
      this.socket.on('user disconnected', () => {
        this.notify(`User Disconnected - ${this.getKeySnippet(this.destinationKey)}`)
        this.destinationPublicKey = null
      })
      this.socket.on('ROOM_FULL', () => {
        this.addNotification(`Cannot join ${this.pendingRoom}, room is full`)
        this.pendingRoom = this.originPublicKey
        this.joinRoom()
      })
      this.socket.on('INTRUSION_ATTEMPT', () => {
        this.addNotification('A third user attempted to join the room.')
      })
    },
    async sendMessage () {
      if (!this.draft || this.draft === '') { return }
      let message = Immutable.Map({
        text: this.draft,
        recipient: this.destinationPublicKey,
        sender: this.originPublicKey
      })
      this.draft = ''
      this.addMessage(message.toObject())

      if (this.destinationPublicKey) {
        const encryptedText = await this.getWebWorkerResponse(
          'encrypt', [ message.get('text'), this.destinationPublicKey ])
        const encryptedMsg = message.set('text', encryptedText)
        this.socket.emit('MESSAGE', encryptedMsg.toObject())
      }
    },
    joinRoom () {
      if (this.pendingRoom !== this.currentRoom && this.originPublicKey) {
        this.pendingRoom = this.getKeySnippet(this.pendingRoom)
        this.addNotification(`Connecting to Room - ${this.pendingRoom}`)
        this.messages = []
        this.destinationPublicKey = null
        this.socket.emit('JOIN', this.pendingRoom)
      }
    },
    addMessage (message) {
      this.messages.push(message)
      this.autoscroll(this.$refs.chatContainer)
    },
    addNotification (message) {
      const timestamp = new Date().toLocaleTimeString()
      this.notifications.push({ message, timestamp })
      this.autoscroll(this.$refs.notificationContainer)
    },
    getWebWorkerResponse (messageType, messagePayload) {
      return new Promise((resolve, reject) => {
        const messageId = Math.floor(Math.random() * 100000)
        this.cryptWorker.postMessage([messageType, messageId].concat(messagePayload))
        const handler = function (e) {
          if (e.data[0] === messageId) {
            e.currentTarget.removeEventListener(e.type, handler)
            resolve(e.data[1])
          }
        }
        this.cryptWorker.addEventListener('message', handler)
      })
    },
    sendPublicKey () {
      if (this.originPublicKey) {
        this.socket.emit('PUBLIC_KEY', this.originPublicKey)
      }
    },
    getKeySnippet (key) {
      return key.slice(400, 416)
    },
    autoscroll (element) {
      if (element) { element.scrollTop = element.scrollHeight }
    }
  }
})
