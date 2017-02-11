// following the fantastic tutorial by:
//https://zellwk.com/blog/crud-express-mongodb/

var express = require("express");
var bodyParser = require('body-parser');

// for app
var app = express();

var uri = process.env.MONGODB_URI;
var PORT = process.env.PORT || 8080;

// for mongoDB
var MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// set static views
  app.use(express.static(__dirname + '/views'));
  //Store all HTML files in view folder.
  app.use(express.static(__dirname + '/Scripts'));
  //Store all JS and CSS in Scripts folder.
  app.use(express.static('public'));
  
  app.set('view engine', 'ejs');
  app.set('views', './views');
  
// connect to mongoDB
var db;

MongoClient.connect(uri, (err, database) => {
  if (err) return console.log(err);
  db = database;
  app.listen(PORT, () => {
    console.log('listening on port: ' + PORT);
  });
});

// connect to google search, send req.search as term.
// add req.search to database
// response: google search response body..
// add pagination option

 app.get('/:short_url', function(req, res) {
    console.log("In comes a " + req.method + " to " + req.url);
    console.log(req.query);
    var entered_url = req.query.short_url;
     db.collection('shorturl').find({short_url: entered_url}).each((err, result) => {
        if (err) return console.log(err);
        if (result) {
        
        res.writeHead(302, {'Location': result.original_url});
        res.end();
        return false; 
          
        }
    });
});
 
// get request for recent searches from db 
 
app.get('/', (req, res) => {
  
    res.render('index.ejs');
    
});

