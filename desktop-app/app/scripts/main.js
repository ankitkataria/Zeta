const queryServer = 'http://139.59.10.216:5000/';
const currentWindow = require('electron').remote.getCurrentWindow();
const url = require('url');
const path = require('path');
const toastr = require("toastr");

$('#reg-journalist').click(() => register());

function truncate(str, length) {
  return `${str.slice(0,length)}...`
}

getKeys();

function getKeys() {
  $('.journalists').html('');
  fetch(queryServer + 'get')
    .then(response => {
      return response.json();
    })
    .then(data => {
      let items = [];
      $.each(data, (i, item) => {
        items.push('<li key=' + item.id + '>' + item.key + '</li>');
      });
      $('.journalists').append(items.join(''));
    })
    .catch(err => {
      throw err;
    });
}

function register() {
  toastr.success("Registering Public key ...")
  fetch(queryServer + 'insert', {
    method: 'POST',
    body: 'key=' + currentWindow.custom.keys.pubKey,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).then(response => {
    jQuery('.reg-status').css('opacity', '1');
  });
  getKeys();
}

function getKeyOptions () {
  fetch(queryServer + 'get')
    .then(response => {
      return response.json()
    })
    .then(data => {
      let items = []

      $.each(data, (i, item) => {
        items.push('<option value=' + item.key + '>' + truncate(item.key, 50) + '</option>')
      })

      $('#journalists-options').append(items.join(''))
    })
    .catch(err => {
      throw err
    })
}

function changeToChatWindow() {
  currentWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'chat.html'),
      protocol: 'file:',
      slashes: true
    })
  );
}

$('#doc-upload').on('change',() => {
    var fileName = $(this).val();
    $(this).next('.custom-file-label').html(fileName);
});
