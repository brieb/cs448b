
var drawGPAChart = function(div, college){
  var gpaData = getGpaData(college);
  console.log(gpaData);
  if (gpaData == null) return;
  drawBarChart(div, gpaData);
}

var drawRankChart = function(div, college){
  var rankData = getRankData(college);
  console.log(rankData);
  if (rankData == null) return;
  drawBarChart(div, rankData);
}

// Expects data in following format: array of arrays such that each 
//  element in array is [name, val, sumSoFar], start with greatest element
var drawBarChart = function(div, barData) {
  var width = 300;
  var height = 150;
  var rectWidth = 100;
  var rectHeight = 100;

  svg = d3.select(div)
    .append('svg:svg')
    .attr('width',width)
    .attr('height',height);

  var y = d3.scale.linear()
    .domain([0, 100])
    .range([0, rectHeight]);

  svg.selectAll("rect")
    .data(barData)
    .enter().append("svg:rect")
    .attr("x", (width - rectWidth)/2.0)
    .attr("y", function(d, i) {
      return (height - rectHeight)/2.0 + y(d[2]);})
    .attr("width", rectWidth)
    .attr("height", function(d, i) { 
        return y(d[1])})
    .style("fill", function(d,i){
      var valr = Math.round(255 - (255-255) * (i+1)/5);
      var valg = Math.round(255 - (255-102) * (i+1)/5);
      var valb = Math.round(255 - (255-51) * (i+1)/5);
      console.log(valg);
      return '#'+valr.toString(16)+valg.toString(16)+valb.toString(16);
    });

  svg.selectAll("text")
    .data(barData)
    .enter().append("svg:text")
    .attr("x", width - (width - rectWidth)/2 + 5)
    .attr("y", function(d, i) {
      return (height - rectHeight)/2.0 + y(d[2]) + y(d[1])/2;})
    .attr("alignment-baseline","middle")
    .text(function(d,i){
      if (i == 5 || d[1] == 0) return "";
      return "> "+d[0];
    });

  svg.selectAll("text.rule")
    .data(y.ticks(3))
    .enter().append("svg:text")
    .attr("class","rule")
    .attr("x", (width - rectWidth)/2.0 - 20)
    .attr("y", function(d,i) {
      return (height -rectHeight)/2 + y(d)})
    .attr("text-anchor","middle")
    .attr("alignment-baseline","middle")
    .text(String);

  var strokeWidth = 2;
  svg.append("svg:line")
    .attr("x1", (width - rectWidth)/2)
    .attr("x2", rectWidth + (width - rectWidth)/2)
    .attr("y1",height - (height-rectHeight)/2 + strokeWidth/2)
    .attr("y2", height - (height-rectHeight)/2 + strokeWidth/2)
    .attr("stroke", "#111")
    .attr("stroke-width", strokeWidth);
}

var getGpaData = function(college) {
  var gpaData = [['3.75',0,0],['3.5',0,0],['3.25',0,0],['3.0',0,0],['0',0,0]]; // corresponds to >= 3.75, >= 3.5 >= 3.25, >= 3.0, >= 0
  var sumSoFar = 0;
  var dataExists = false;
  for (dem in college["demographics_first_year"]) {
    if (college["demographics_first_year"][dem]["value"] == "had h.s. GPA of 3.75 and higher") {
      var val = parseInt(college["demographics_first_year"][dem]["percentage"]);
      gpaData[0][1] = val;
      gpaData[0][2] = sumSoFar;
      sumSoFar += val;
      dataExists = true;
      continue;
    }
  }
  if (!dataExists) return null;
  for (dem in college["demographics_first_year"]) {
    if (college["demographics_first_year"][dem]["value"] == "had h.s. GPA between 3.5 and 3.74") {
      var val = parseInt(college["demographics_first_year"][dem]["percentage"]);
      gpaData[1][1] = val;
      gpaData[1][2] = sumSoFar;
      sumSoFar += val;
      continue;
    }
  }
  for (dem in college["demographics_first_year"]) {
    if (college["demographics_first_year"][dem]["value"] == "had h.s. GPA between 3.25 and 3.49") {
      var val = parseInt(college["demographics_first_year"][dem]["percentage"]);
      gpaData[2][1] = val;
      gpaData[2][2] = sumSoFar;
      sumSoFar += val;
      continue;
    }
  }
  for (dem in college["demographics_first_year"]) {
    if (college["demographics_first_year"][dem]["value"] == "had h.s. GPA between 3.0 and 3.24") {
      var val = parseInt(college["demographics_first_year"][dem]["percentage"]);
      gpaData[3][1] = val;
      gpaData[3][2] = sumSoFar;
      sumSoFar += val;
      continue;
    }
  } 
  gpaData[4][1] = 100 - sumSoFar;
  gpaData[4][2] = sumSoFar;
  return gpaData;
}

var getRankData = function(college) {
  // each element in array is [name, val, sumSoFar], start with greatest element
  var rankData = [['10th',0,0],['25th',0,0],['50th',0,0],['other',0,0]]; 
  var sumSoFar = 0;
  var dataExists = false;
  for (dem in college["demographics_first_year"]) {
    if (college["demographics_first_year"][dem]["value"] == "in top 10th of graduating class") {
      var val = parseInt(college["demographics_first_year"][dem]["percentage"]);
      rankData[0][1] = val - sumSoFar;
      rankData[0][2] = sumSoFar;
      sumSoFar = val;
      dataExists = true;
      continue;
    }
  }
  if (!dataExists) return null;
  for (dem in college["demographics_first_year"]) {
    if (college["demographics_first_year"][dem]["value"] == "in top quarter of graduating class") {
      var val = parseInt(college["demographics_first_year"][dem]["percentage"]);
      rankData[1][1] = val - sumSoFar;
      rankData[1][2] = sumSoFar;
      sumSoFar = val;
      continue;
    }
  }
  for (dem in college["demographics_first_year"]) {
    if (college["demographics_first_year"][dem]["value"] == "in top half of graduating class") {
      var val = parseInt(college["demographics_first_year"][dem]["percentage"]);
      rankData[2][1] = val - sumSoFar;
      rankData[2][2] = sumSoFar;
      sumSoFar = val;
      continue;
    }
  }
  rankData[3][1] = 100 - sumSoFar;
  rankData[3][2] = sumSoFar;
  return rankData;
}