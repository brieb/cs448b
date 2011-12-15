/* Usage: call drawMap("#divid") once data variable is set to college data from json.
  collegeSelectedInMap(college) returns true if a college is selected in the map
 
  Depends on file 'us-states.json' in same directory

  Depends on the following html/css:
  <script type="text/javascript" src="d3/d3.js"></script>
  <script type="text/javascript" src="d3/d3.geo.js"></script> 
  <script type="text/javascript" src="d3/d3.geom.js"></script> 
  <style type="text/css"> 
    #states {
      stroke: #fff;
      fill: #ddd;
      stroke-width: 1.5px;
    }   
    #colleges {
      fill: #000;
      stroke-width: 0px;
    }
    .selector {
      fill-opacity: 0;
      stroke-width: 3px;
      stroke: #555;
    }
    .collegePoint {
      fill: #111;
      opacity: 0.3;
    }
  </style>
*/

var mapClickDown = {"x":0,"y":0};
var mapClickUp = {"x":0,"y":0};
var mouseIsDown = false;
var curMapSelection = null;
var mapSvg;
var mapColleges;
var mapSelections = {};

var drawMap = function(div) {
  var width = 700;
  var height = 400;
  var svg = d3.select(div)
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
    
  addDataSelectionCallback(selectSchoolOnMap); 
}

var mouseDown = function(e) {
  if(mouseIsDown) {
    curMapSelection = null;
  }
  mouseIsDown = true;
  mapClickDown = {"x":e.offsetX, "y":e.offsetY};
}

var mouseMove = function(e) {
  if (mouseIsDown) {
    if(curMapSelection == null) {
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
    if(curMapSelection == null) drawMapSelection();
    else redrawMapSelection();
    mapSelections[curMapSelection.attr("cx")+"_"+
               curMapSelection.attr("cy")+"_"+
               curMapSelection.attr("r")] = curMapSelection;
    curMapSelection = null;
  }
}

var clearSelector = function(e){
  console.log('clearing!');
  console.log(e);
  if (e.target.getAttribute("class") == "selector"){
    d3.select(e.target).remove();
    delete mapSelections[e.target.getAttribute("cx")+"_"+
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
  curMapSelection = mapSvg.append("svg:circle")
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
  curMapSelection.attr("cx", (x1+mapClickUp.x)/2)
    .attr("cy", (y1+mapClickUp.y)/2)
    .attr("r", r);
  
}

var colorColleges = function() {
  mapSvg.selectAll(".collegePoint").style("fill","#111");
  mapSelection().style("fill","#1960AA");
}

var mapSelection = function(){
  return mapSvg.selectAll(".collegePoint").filter(function(d){
    if (isEmpty(mapSelections)) return true;
    var albersProj = d3.geo.albersUsa();
    var x = albersProj(d.geometry.coordinates)[0];
    var y = albersProj(d.geometry.coordinates)[1];
    for (key in mapSelections) {
      if (mapSelections[key]!=undefined){
        var distanceToCenter = 
          Math.sqrt(Math.pow((x-mapSelections[key].attr("cx")),2)+
                      Math.pow((y-mapSelections[key].attr("cy")),2));
        if (distanceToCenter < mapSelections[key].attr("r")) {
          return true;
        }
      }
    }
    return false;
  });
}

var collegeSelectedInMap = function(college) {
  if (isEmpty(mapSelections)) return true;
  var albersProj = d3.geo.albersUsa();
  var x = albersProj(college.longitude)[0];
  var y = albersProj(college.latitude)[1];
  for (key in mapSelections) {
    if (mapSelections[key]!=undefined){
      var distanceToCenter = 
        Math.sqrt(Math.pow((x-mapSelections[key].attr("cx")),2)+
                    Math.pow((y-mapSelections[key].attr("cy")),2));
      if (distanceToCenter < mapSelections[key].attr("r")) {
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

var getMapOffset = function(college) {
  var albersProj = d3.geo.albersUsa();
  var x = albersProj(college.longitude)[0];
  var y = albersProj(college.latitude)[1];
  return {'x': x, 'y': y};
}

var selectSchoolOnMap = funtion(index) {
  var college = allData[index];
  colorColleges();
  mapSvg.selectAll(".collegePoint").filter(function(d,i){
    if (i == index) return true;
    return false;
  })
  .style("fill","#FF9933");
}