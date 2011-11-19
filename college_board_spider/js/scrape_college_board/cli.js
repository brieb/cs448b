
/**
 * Module dependencies.
*/

var express = require('express')
, routes = require('./routes')
, jsdom = require('jsdom')
, request = require('request')
, url = require('url')

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
    scripts: ['jquery.js']
  }, function(err, win){
    var $ = win.jQuery;

    //var address = $('#main_address').text();
    console.log( $('#main_address'));
  });
});

//request({ uri:full_url_explore }, function(err, resp, body){
  //jsdom.env({
    //html: body,
    //scripts: ['jquery.js']
  //}, function(err, win){
    //var $ = win.jQuery;

    ////console.log($('a'));
  //});
//});

