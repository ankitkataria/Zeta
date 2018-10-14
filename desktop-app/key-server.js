const sqlite3 = require('sqlite3');
const express = require('express');
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let db = new sqlite3.Database('addresses.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS keys (id INTEGER PRIMARY KEY, key TEXT UNIQUE)");
});

app.get('/get', async (req, res, next) => {
  try {
    await db.all('SELECT * FROM keys', (err, rows) => {
    	res.send(rows);
    });
  } catch (err) {
    next(err);
  }
});

app.post('/insert', (req, res) => {
  try {  
	  var q = db.prepare("INSERT INTO keys VALUES(?, ?)");
    q.run(null, req.body.key); 
	  q.finalize();
  } catch(er) {
    console.log(e)
  }
  res.end();
	console.log('Inserted!');
});


app.listen(5000);