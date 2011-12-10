var div = d3.select('#filterChart'),
    width = 200,
    height = 400,
    xMargin = 20,
    yMargin = 10,
    geoBuffer = 60,
    rectHeight = 5;

var selectedFilter = undefined;

function drawFilterChart()
{
    var y = d3.scale.linear()
	.domain([0, filterKeys.length])
	.range([yMargin + geoBuffer, height - yMargin]);
    
    var svg = div.append('svg:svg')
	.attr('width',width)
	.attr('height',height);

    var sliders = svg.selectAll('g.filter')
	.data(filterKeys)
	.enter().append('svg:g')
	.attr('class','filter')
	.attr('name',function(d,i) { return filterVariables[d].name; })
	.attr('transform',function(d,i) {
		return 'translate('+xMargin+','+y(i)+')'});
    
    sliders.append('svg:rect')
	.attr('class','filter')
	.attr('width',width - 2 * xMargin)
	.attr('height',rectHeight)
	.on('click',filterMouseClick);
    /*
    sliders.append('svg:circle')
	.attr('class','slider')
	.attr('r',6)
	.attr('cy',rectHeight/2);
    sliders.append('svg:circle')
	.attr('class','slider')
	.attr('r',6)
	.attr('cx',width - 2*xMargin)
	.attr('cy',rectHeight/2);*/
}

function filterMouseClick(d)
{
    var filter = d3.select(this.parentNode);
    if (selectedFilter != filter) {
	if (selectedFilter) {
	    selectedFilter.transition()
    }
    filter.map(function(d) {
	    console.log(d);
	    if (selectedFilter != filter) {
		
	    }
	});
}