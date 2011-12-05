var width = 700;
var height = 400;
var svg = d3.select('#chart1')
  .append('svg:svg');
//  .attr('width', width)
//  .attr('height', height);

var path = d3.geo.path()
  .pointRadius(10);
var albersProj = d3.geo.albersUsa();

var states = svg.append("svg:g")
  .attr("id", "states")
  .attr("transform", "scale(1.0)");

var colleges = svg.append("svg:g")
  .attr("id", "colleges")
  .attr("transform", "scale(1.0)");

d3.json("d3/examples/data/us-states.json", function(json) {
    states.selectAll("path")
      .data(json.features)
      .enter().append("svg:path")
      .attr("d", path);
  });

var collegeData = { 
  "type": "FeatureCollection", 
  "features": [
    { "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [-122,37]},
      "properties": {"name": "Stanford University"}
    },
    { "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [-71.6,42.5]},
      "properties": {"name": "Harvard University"}
    },
    { "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [-74.4,40.2]},
      "properties": {"name": "Princeton University"}
    },
    { "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [-72.9,41.3]},
      "properties": {"name": "Yale University"}
    },
    { "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [-87.7,42.0]},
      "properties": {"name": "Northwestern University"}
    }        
  ]
}

colleges.selectAll("path")
  .data(collegeData.features)
  .enter().append("svg:path")
  .attr("d", path)
  .attr("class", "circle");

colleges.selectAll("text")
  .data(collegeData.features)
  .enter().append("svg:text")
  .attr("x", function(d) {
    return albersProj(d.geometry.coordinates)[0] + 10;
  })
  .attr("y", function(d) {
    return albersProj(d.geometry.coordinates)[1] + 5;
  })
  .text(function(d) {
    return d.properties.name;
  })
  .attr("class","text");

// d3.json("collegeData.txt", function(json) {
//   console.log(json);
// });