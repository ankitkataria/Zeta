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

  const keysPath = '.keys';

  if (!fs.existsSync(keysPath)) {
    fs.writeFile(keysPath, generateKeyPair(), err => {
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
    });
  }
  fs.readFile(keysPath, 'utf8', (err, data) => {
    if (err) {
      return console.log(err);
    }
    mainWindow.custom = {
      'keys': JSON.parse(data)
    };
  });
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'app/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

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

function generateKeyPair() {
  const key = new NodeRSA({
    b: 1024
  });
  const pubKey = key.exportKey('pkcs8-public').replace('-----BEGIN PUBLIC KEY-----\n', '').replace('\n-----END PUBLIC KEY-----', '');
  const privKey = key.exportKey('pkcs8-private').replace('-----BEGIN PRIVATE KEY-----\n', '').replace('\n-----END PRIVATE KEY-----', '');

  return JSON.stringify({
    pubKey: pubKey,
    privKey: privKey
  });
}
