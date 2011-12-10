var mapClickDown = {"x":0,"y":0};
var mapClickUp = {"x":0,"y":0};
var mouseIsDown = false;
var curSelection = null;
var mapSvg;
var mapColleges;
var selections = {};
var drawMap = function() {
  var width = 700;
  var height = 400;
  var svg = d3.select('#chart1')
    .append('svg:svg')
    .attr('onmousedown','mouseDown(event)')
    .attr('onmousemove','mouseMove(event)')
    .attr('onmouseup','mouseUp(event)');
  //  .attr('width', width)
  //  .attr('height', height);

  mapSvg = svg;

  var path = d3.geo.path()
    .pointRadius(3);
  var albersProj = d3.geo.albersUsa();

  var states = svg.append("svg:g")
    .attr("id", "states")
    .attr("transform", "scale(1.0)");

  var colleges = svg.append("svg:g")
    .attr("id", "colleges")
    .attr("transform", "scale(1.0)");
  mapColleges = colleges;

  d3.json("us-states.json", function(json) {
      states.selectAll("path")
        .data(json.features)
        .enter().append("svg:path")
        .attr("d", path);
    });

  // var collegeData = { 
  //   "type": "FeatureCollection", 
  //   "features": [
  //     { "type": "Feature",
  //       "geometry": {"type": "Point", "coordinates": [-122,37]},
  //       "properties": {"name": "Stanford University"}
  //     },
  //     { "type": "Feature",
  //       "geometry": {"type": "Point", "coordinates": [-71.6,42.5]},
  //       "properties": {"name": "Harvard University"}
  //     },
  //     { "type": "Feature",
  //       "geometry": {"type": "Point", "coordinates": [-74.4,40.2]},
  //       "properties": {"name": "Princeton University"}
  //     },
  //     { "type": "Feature",
  //       "geometry": {"type": "Point", "coordinates": [-72.9,41.3]},
  //       "properties": {"name": "Yale University"}
  //     },
  //     { "type": "Feature",
  //       "geometry": {"type": "Point", "coordinates": [-87.7,42.0]},
  //       "properties": {"name": "Northwestern University"}
  //     }        
  //   ]
  // }

  var mapFeatures = [];
  for (var i = 0; i < data.length; i++){
    mapFeatures.push( 
      { "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [parseFloat(data[i].longitude), parseFloat(data[i].latitude)]},
        "properties": {"name": data[i].name}
      });
  }
  colleges.selectAll("path")
    .data(mapFeatures)
    .enter().append("svg:path")
    .attr("d", path)
    .attr("class", "collegePoint")
    .style("fill","#1960AA");  
}

var mouseDown = function(e) {
  if(mouseIsDown) {
    curSelection = null;
  }
  mouseIsDown = true;
  mapClickDown = {"x":e.offsetX, "y":e.offsetY};
}

var mouseMove = function(e) {
  if (mouseIsDown) {
    if(curSelection == null) {
      mapClickUp = {"x":e.offsetX, "y":e.offsetY};
      drawMapSelection();
    } else if (Math.abs(e.offsetX-mapClickUp.x) > 5 ||
                Math.abs(e.offsetY-mapClickUp.y) > 5) {
      mapClickUp = {"x":e.offsetX, "y":e.offsetY};
      redrawMapSelection();
    }
  }
}

var mouseUp = function(e) {
  mouseIsDown = false;
  mapClickUp = {"x":e.offsetX, "y":e.offsetY};
  changeMapSelection(e);
  colorColleges();
}

var changeMapSelection = function(e) {
  if (mapClickDown.x == mapClickUp.x &&
     mapClickDown.y == mapClickUp.y) clearSelector(e);
  else {
    if(curSelection == null) drawMapSelection();
    else redrawMapSelection();
    selections[curSelection.attr("cx")+"_"+
               curSelection.attr("cy")+"_"+
               curSelection.attr("r")] = curSelection;
    curSelection = null;
  }
}

var clearSelector = function(e){
  console.log('clearing!');
  console.log(e);
  if (e.target.getAttribute("class") == "selector"){
    d3.select(e.target).remove();
    delete selections[e.target.getAttribute("cx")+"_"+
           e.target.getAttribute("cy")+"_"+
           e.target.getAttribute("r")];
  }
}

var drawMapSelection = function() {
  var x1 = mapClickDown.x;
  var y1 = mapClickDown.y;
  var x2 = mapClickUp.x;
  var y2 = mapClickUp.y;
  var r = Math.sqrt(Math.pow(x1-x2,2)+ Math.pow(y1-y2,2))/2;
  curSelection = mapSvg.append("svg:circle")
    .attr("cx", (x1+mapClickUp.x)/2)
    .attr("cy", (y1+mapClickUp.y)/2)
    .attr("r", r)
    .attr("class", "selector");
}
var redrawMapSelection = function() {
  var x1 = mapClickDown.x;
  var y1 = mapClickDown.y;
  var x2 = mapClickUp.x;
  var y2 = mapClickUp.y;
  var r = Math.sqrt(Math.pow(x1-x2,2)+ Math.pow(y1-y2,2))/2;
  curSelection.attr("cx", (x1+mapClickUp.x)/2)
    .attr("cy", (y1+mapClickUp.y)/2)
    .attr("r", r);
  
}

var colorColleges = function() {
  mapSvg.selectAll(".collegePoint").style("fill","#111");
  mapSelection().style("fill","#1960AA");
}

var mapSelection = function(){
  return mapSvg.selectAll(".collegePoint").filter(function(d){
    if (isEmpty(selections)) return true;
    var albersProj = d3.geo.albersUsa();
    var x = albersProj(d.geometry.coordinates)[0];
    var y = albersProj(d.geometry.coordinates)[1];
    for (key in selections) {
      if (selections[key]!=undefined){
        var distanceToCenter = 
          Math.sqrt(Math.pow((x-selections[key].attr("cx")),2)+
                      Math.pow((y-selections[key].attr("cy")),2));
        if (distanceToCenter < selections[key].attr("r")) {
          return true;
        }
      }
    }
    return false;
  });
}

var collegeSelectedInMap = function(college) {
  if (isEmpty(selections)) return true;
  var albersProj = d3.geo.albersUsa();
  var x = albersProj(college.longitude)[0];
  var y = albersProj(college.latitude)[1];
  for (key in selections) {
    if (selections[key]!=undefined){
      var distanceToCenter = 
        Math.sqrt(Math.pow((x-selections[key].attr("cx")),2)+
                    Math.pow((y-selections[key].attr("cy")),2));
      if (distanceToCenter < selections[key].attr("r")) {
        return true;
      }
    }
  }
  return false;
}

var isEmpty = function(obj) {
  for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
          return false;
  }
  return true;
}

// work on little charts for: demographics, graduating class, gpa