'use strict'

const { app, BrowserWindow, dialog } = require("electron");
const path = require('path');
const url = require('url');

let mainWindow = null;

function createWindow(){
  mainWindow = new BrowserWindow({
    width: 1200,
    height:1400
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "build/index.html"),
      protocol: 'file:',
      slashes: true
    })
  );

  // mainWindow.webContents.openDevTools()

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if(process.platform !== 'darwin'){
    app.quit()
  }
});

app.on('activate', () => {
  if(mainWindow == null){
    createWindow()
  }
});
