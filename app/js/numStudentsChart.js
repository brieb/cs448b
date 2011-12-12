var drawStudentChart = function() {
  var width = 150;
  var height = 150;

  svg = d3.select('#chart1')
    .append('svg:svg')
    .attr('width',width)
    .attr('height',height);

  var x = d3.scale.linear()
    .domain([0, 40000])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, 40000])
    .range([0, height]);

  svg.selectAll("circle")
    .data(data)
    .enter().append("svg:circle")
    .attr("cx", function(d, i) { return x(d["num_undergrad"])})
    .attr("cy", function(d, i) { return height - y(d["num_grad"])})
    .attr("r", 3)

  svg.append("svg:line")
    .attr("y1",0)
    .attr("y2", height)
    .attr("stroke", "#000")

  svg.append("svg:line")
    .attr("x1",0)
    .attr("x2", width)
    .attr("y1", height)
    .attr("y2", height)
    .attr("stroke", "#000")
  
  svg.call(brush.x(x[data.x]).y(y[data.y]));
}

var brush = d3.svg.brush()
    .on("brushstart", brushstart)
    .on("brush", brush)
    .on("brushend", brushend);

// Clear the previously-active brush, if any.
function brushstart(p) {
  if (brush.data !== p) {
    svg.call(brush.clear());
    brush.x(x[p.x]).y(y[p.y]).data = p;
  }
}

// Highlight the selected circles.
function brush(p) {
  console.log("brushing");
  var e = brush.extent();
  console.log(e);
  svg.selectAll("circle").attr("class", function(d) {
    return e[0][0] <= d[p.x] && d[p.x] <= e[1][0]
        && e[0][1] <= d[p.y] && d[p.y] <= e[1][1]
        ? "collegePoint" : null;
  });
}

// If the brush is empty, select all circles.
function brushend() {
  if (brush.empty()) svg.selectAll("circle").attr("class", function(d) {
    return "collegePoint";
  });
}