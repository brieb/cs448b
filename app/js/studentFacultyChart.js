var drawStudentFacultyChart = function() {
  var width = 150;
  var height = 150;

  var svg = d3.select('#chart1')
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
}