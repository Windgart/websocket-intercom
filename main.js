const express = require('express')
const app = express();
require("dotenv").config();
const server = require('http').createServer(app);
const WebSocketServer = require('ws')
const EventEmitter = require('events')

const NotificationEmitter = new EventEmitter()

const { PORT, WEBHOOK_PORT } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const wss = new WebSocketServer.Server({ server: server });
let uniqueId = undefined

wss.on('connection', (ws) => {
  console.log('A new client connected')
  ws.send('Webchat web socket connect, waiting on webhook notifications');

  ws.on('message', function incoming(message) {
    if(message.includes('ID')) {
      uniqueId = message
      console.log('received ID:', message.toString());
    }
    
  });
  NotificationEmitter.on('notification', (data) => {
    console.log('sending notification', data)
    ws.send(JSON.stringify(data))
  })

});


app.get('/', (res) => {
    res.send('Hello World')
});

app.post('/chatbot-notifications', (req, res) => {
    const notificationData = req.body.data || null
  
  if(notificationData) {
    console.log('notificationData emitted: ', notificationData);
    NotificationEmitter.emit('notification', notificationData)
    res.sendStatus(200)
  } else {
    res.status(400).send('bad request')
  }
})

   
server.listen(PORT, () => {
    console.log(`Websocket listening at ws://localhost:${PORT}`);
  });

app.listen(WEBHOOK_PORT, () => {
  console.log(`Webhook listening at http://localhost:${WEBHOOK_PORT}`)
});
  