const sqlite3 = require('sqlite3');
const express = require('express');
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let db = new sqlite3.Database('./db/addresses.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS keys (id INTEGER PRIMARY KEY, key TEXT)");
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
	var q = db.prepare("INSERT INTO keys(id,text) SELECT 5, 'text to insert' WHERE NOT EXISTS(SELECT 1 FROM memos WHERE id = 5 AND text = 'text to insert');");
	q.run(null, req.body.key); 
	q.finalize();
  res.end();
	console.log('Inserted!');
});


app.listen(5000);