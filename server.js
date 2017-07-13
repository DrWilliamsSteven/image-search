var express = require("express");
var bodyParser = require('body-parser');
var request = require('request');

var app = express();

var dotenv = require('dotenv');
dotenv.config();
var uri = process.env.MONGODB_URI;
var PORT = process.env.PORT || 8080;

// for mongoDB
var MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// set static views
app.use(express.static(__dirname + '/views'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/Scripts'));
//Store all JS and CSS in Scripts folder.
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

var db;
MongoClient.connect(uri, (err, database) => {
  if (err) return console.log(err);
  db = database;
  app.listen(PORT, () => {
    console.log('listening on port: ' + PORT);
  });
});

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/imagesearch/:search', function (req, res) {
  console.log("In comes a " + req.method + " to " + req.url);
  console.log("Request: " + req.url.slice(13));

  var search_term = req.url.slice(13);
  var startNum = 1;

  var re = /\?offset\=/;
  if (re.test(search_term)) {
    console.log("Yes there is an offset");
    var pageNum = search_term.slice(search_term.indexOf('=') + 1);
    startNum = (parseInt(pageNum) - 1) * 10 + 1;
    search_term = search_term.slice(0, search_term.indexOf('?'));
  }
  else {
    console.log("No offset");
  }

  var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyCd8PNPlNZ62URqPKs9aMES0l9PcBw0GLA&cx=002994538534406751618:ficzbfvypwm&searchType=image&q=" + search_term + "&fields=kind,items(title, link, snippet)&start=" + startNum; //
  var urlencoded = encodeURI(url);

  request(urlencoded, function (error, response, body) {

    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      //console.log(body);
      res.writeHead(200, {
        "Content-Type": "application/json"
      });
      res.end(JSON.stringify(result.items, null, 2));

      var terms_to_save = {
        search_term: search_term,
        when: new Date().toString()
      };

      db.collection('recent_image_search').save(terms_to_save, (err, result) => {
        if (err) return console.log(err);
        console.log('saved to database');

      });
    }
  });
});

app.get('/latest', function (req, res) {
  console.log("In comes a " + req.method + " to " + req.url);

  var myCursor = db.collection('recent_image_search').find({}, {
    _id: 0
  }).sort({
    when: -1
  }).limit(10).toArray(function (err, doc) {
    if (err) return console.log(err);
    //called once for each doc returned
    console.log(doc)
    if (doc) {
      //res.json(doc);
      res.end(JSON.stringify(doc, null, 2));
      return false;
    }
  });
});
