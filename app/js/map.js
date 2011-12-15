/* Usage: call drawMap("#divid", width, height) once allData variable is set to college allData from json.
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
var brushSelection;
var mapSelections = {};
var albersProj;
var mapFeatures;
var drawMap = function(div, width, height) {
  var scale = Math.min(width/900, height/596); //constants dependent on us-states.json
  var svg = d3.select(div)
    .append('svg:svg')
    .attr('onmousedown','mouseDown(event)')
    .attr('onmousemove','mouseMove(event)')
    .attr('onmouseup','mouseUp(event)')
    .attr('width', width)
    .attr('height', height);

  mapSvg = svg;

  setUpDocumentListeners();

  var path = d3.geo.path()
    .pointRadius(3);
    
  albersProj = d3.geo.albersUsa();
  var scale0 = albersProj.scale();
  var trans0 = albersProj.translate();
  albersProj.scale(scale0 * scale)
    .translate([trans0[0]*scale,trans0[1]*scale]);

  var states = svg.append("svg:g")
    .attr("id", "states")
    .attr("transform", "scale("+scale+")");

  var colleges = svg.append("svg:g")
    .attr("id", "colleges")
    .attr("transform", "scale("+scale+")");
  
  brushSelection = svg.append("svg:g")
    .attr("id", "collegeSelected")
    .attr("transform", "scale("+scale+")");

  d3.json("../us-states.json", function(json) {
      states.selectAll("path")
        .data(json.features)
        .enter().append("svg:path")
        .attr("d", path);
    });

  mapFeatures = [];
  for (var i = 0; i < allData.length; i++){
    mapFeatures.push( 
      { "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [parseFloat(allData[i].longitude), parseFloat(allData[i].latitude)]},
        "properties": {"name": allData[i].name, "index": i}
      });
  }
  colleges.selectAll("path")
    .data(mapFeatures)
    .enter().append("svg:path")
    .attr("d", path)
    .attr("class", "collegePoint")
    .style("fill","#1960AA")
    .on('mouseover',function(d) {
        d3.select(this).style('opacity', 1.0);
    })
    .on('mouseout',function(d) {
        d3.select(this).style('opacity', null);
    })
    .on('click', function(d) {
        if (allData[d.properties.index].pass)
            selectData(d.properties.index);
    });
  

  addDataSelectionCallback(selectSchoolOnMap); 
  addDataChangeCallback(colorColleges);
}

var mouseDown = function(e) {
  if(mouseIsDown) {
    curMapSelection = null;
  }
  mapClickDown = {"x":e.offsetX, "y":e.offsetY};
  mouseIsDown = true;
}

var mouseMove = function(e) {
  if (!mouseIsDown && curMapSelection != null) {
    curMapSelection.remove();
    curMapSelection = null;
    return;
  }
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
  if(mouseIsDown) {
    mapClickUp = {"x":e.offsetX, "y":e.offsetY};
    changeMapSelection(e);
    colorColleges();
  }
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

  var sData = outputSelectionData();
  
  updateMapFilter(sData);
}

var outputSelectionData = function()
{
    var res = [];
    for (key in mapSelections) {
      if (mapSelections[key]!=undefined){
        var c = mapSelections[key];
        var d = [c.attr("cx")*1.0,c.attr("cy")*1.0,c.attr("r")*1.0];
        res.push(d);
      }
    }
    return res;
}

var enableMapSelectors = function(vals)
{
    for (var i = 0; i < vals.length; i++) {
        var curr = mapSvg.append("svg:circle")
            .attr("cx", vals[i][0])
            .attr("cy", vals[i][1])
            .attr("r", vals[i][2])
            .attr("class", "selector");
        mapSelections[curr.attr("cx")+"_"+
               curr.attr("cy")+"_"+
               curr.attr("r")] = curr;
    }
}

var clearSelector = function(e){
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
  var r = Math.sqrt(Math.pow(x1-x2,2)+ Math.pow(y1-y2,2));
  curMapSelection = mapSvg.append("svg:circle")
    .attr("cx", x1)
    .attr("cy", y1)
    .attr("r", r)
    .attr("class", "selector");
}
var redrawMapSelection = function() {
  var x1 = mapClickDown.x;
  var y1 = mapClickDown.y;
  var x2 = mapClickUp.x;
  var y2 = mapClickUp.y;
  var r = Math.sqrt(Math.pow(x1-x2,2)+ Math.pow(y1-y2,2));
  curMapSelection.attr("cx", x1)
    .attr("cy", y1)
    .attr("r", r);
  
}

var colorColleges = function() {
  mapSvg.selectAll(".collegePoint")
    .style("fill", function(d, i) {
        return allData[d.properties.index].pass ? 
            "#1960AA" : "#111";
    })
    .style("opacity", function(d) {
        return allData[d.properties.index].pass ?
            0.3 : 0.1;
    });
}

var mapSelection = function(){
  return mapSvg.selectAll(".collegePoint").filter(function(d){
    if (isEmpty(mapSelections)) return true;
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
  var pos = albersProj([college.longitude,college.latitude]);
  var x = pos[0], y = pos[1];
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
  var x = albersProj(college.longitude)[0];
  var y = albersProj(college.latitude)[1];
  return {'x': x, 'y': y};
}

var selectSchoolOnMap = function(index) {
  var path = d3.geo.path()
    .pointRadius(6);
  var sel = brushSelection.selectAll("path")
    .data(index < 0 ? [] : [mapFeatures[index]], function(d) { return d.properties.index; });
  sel.enter().append("svg:path")
        .attr("d", path)
        .attr("class", "selectedCollege")
        .style("fill","#FF9933")
        .style("opacity",1)
        .on('click',function(d) {
            selectData(d.properties.index);
        });
  sel.exit().remove();
}

var setUpDocumentListeners = function(){
  document.body.onmouseup = function() {
    mouseIsDown = false;
  }
  document.body.onmouseout = function(e) {
    e = e ? e : window.event;
    var from = e.relatedTarget || e.toElement;
    if (!from || from.nodeName == "HTML") {
      if(curMapSelection != null) {
        curMapSelection.remove();
        curMapSelection = null;
      }
      mouseIsDown = false;
    }
  }
}