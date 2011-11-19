
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , jsdom = require('jsdom')
  , request = require('request')
  , url = require('url')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.get('/cb', function(req, res) {
  var url_root = "http://collegesearch.collegeboard.com";
  var college_id = 3387;
  var url_explore = "/search/more_explore.jsp";

  var full_url_explore = url_root + url_explore + "?collegeId=" + college_id;

  var uri = "http://localhost/cs448b/college_board_spider/php/dummy_data/College%20Search%20-%20Stanford%20University%20-%20The%20Farm%20-%20At%20a%20Glance.html";

  request({ uri: uri }, function(err, response, body){
    var self = this;
    self.items = [];

    jsdom.env({
      html: body,
      scripts: ['http://code.jquery.com/jquery-1.6.min.js']
    }, function(err, win){
      var $ = win.jQuery;

      var address = $('#main_address').text();
      console.log(address);
      res.end(address);
    })
  
  });

  request({ uri:url_root + url_explore, collegeId:college_id }, function(err, resp, body){
    console.log(resp);
  });

});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
