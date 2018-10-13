'use strict';

const { app, BrowserWindow, dialog } = require('electron');
const pug = require('electron-pug')({ pretty: true });
const path = require('path');
const url = require('url');
const fs = require('fs');
const NodeRSA = require('node-rsa');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1400
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'app/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow == null) {
    createWindow();
  }
});

const key = new NodeRSA({
  b: 1024
});
const pubKey = key.exportKey('pkcs8-public');
const privKey = key.exportKey('pkcs8-private');
const keys = {
  pubKey: pubKey,
  privKey: privKey
};
const keysContent = JSON.stringify(keys);
const keysPath = '.keys';

if (fs.existsSync(keysPath)) {
  fs.readFile(keysPath, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    console.log(JSON.parse(data).pubKey);
    console.log(JSON.parse(data).privKey);
  });
} else {
  fs.writeFile(keysPath, keysContent, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
  });
}
