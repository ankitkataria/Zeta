const queryServer = 'http://localhost:5000/';
const currentWindow = require('electron').remote.getCurrentWindow();
const url = require('url');
const path = require('path');

$('#reg-journalist').click(() => register());

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
  fetch(queryServer + 'insert', {
    method: 'POST',
    body: 'key=' + currentWindow.custom.keys.pubKey,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).then(response => {
    jQuery('.reg-status').css('opacity', '1');
  });
  getKeys();
}

$('#doc-upload').on('change',() => {
    var fileName = $(this).val();
    $(this).next('.custom-file-label').html(fileName);
});

$('#private-messaging').click(() => {
  currentWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'chat.html'),
      protocol: 'file:',
      slashes: true
    })
  );

});

