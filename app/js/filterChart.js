var div = d3.select('#filterChart'),
    width, height, rectWidth,
    xMarginLeft = 120.5,
    xMarginRight = 40.5,
    yMargin = 10.5,
    geoBuffer = 60,
    rectHeight = 5,
    nomSpace = 2.5,
    textOffset = rectHeight * 2 + 12;

var strokeDefault = "#888",
    strokeHover = "#444",
    fillDefault = "#fff",
    fillSelected = "#aaa",
    opacityDefault = 0.5,
    opacitySelected = 1.0,
    opacityHover = 1.0;

var lastHovered = undefined,
    selected = undefined,
    selectedFilter = undefined;

var paths;
var filterVals = [];
function initializeFilterVals()
{
    for (var i = 0; i < filterKeys.length; i++) {
        filterVals[i] = filterVariables[filterKeys[i]];
        filterVals[i].key = filterKeys[i];
        filterVals[i].index = i;

        if (filterVals[i].type == "quantitative") {
        filterVals[i].toPixel = d3.scale.linear()
            .domain([filterVals[i].min, filterVals[i].max])
            .range([0, rectWidth]);
        }
    }
}

function drawFilterChart(divTag, w, h)
{
    div = d3.select(divTag);
    if (!div) {
        console.log("Couldn't find div " + divTag);
        return;
    }   
    width = w;
    console.log("width is " + width);
    height = h;
    rectWidth = width - xMarginLeft - xMarginRight;
    
    initializeFilterVals();

    var y = d3.scale.linear()
	.domain([0, filterKeys.length])
	.range([yMargin + geoBuffer, height - yMargin]);

    var x = d3.scale.linear()
	.domain([0, 1.0])
	.range([xMarginLeft, width - xMarginRight]);

    for (var i = 0; i < filterKeys.length; i++)

    div.on('mouseup',mouseup)
	.on('mouseout',mouseup);
    
    var svg = div.append('svg:svg')
	.attr('width',width)
	.attr('height',height);

    // Set up paths
    
    calculatePaths();
    svg.selectAll('path.pass')
	.data(paths)
	.enter()
	.append('svg:path')
	.attr('class','pass')
	.attr('d', d3.svg.line()
	      .x(function(d) { return x(d.x); })
	      .y(function(d) { return y(d.y) + rectHeight * .5; }))
	.on('mouseover', function(d) {
		d3.select(this).attr('class','select');
	    })
	.on('mouseout',function(d) {
		d3.select(this).attr('class','fail');
	    })
	.append('svg:title')
	.text(function(d,i) { return allData[i].name; });

    // Set up general g's

    var sliders = svg.selectAll('g.filter')
	.data(filterVals, function(d) { return d.name; })
	.enter().append('svg:g')
	.attr('class','filter')
	.attr('name',function(d,i) { return d.name; })
	.attr('transform',function(d,i) {
		return 'translate('+xMarginLeft+','+y(i)+')'})
	.style('opacity',opacityDefault);
    
    // Set up quantitative boxes

    var qsliders = svg.selectAll('g.filter')
	.filter(function(d) { return d.type == "quantitative"; });
    qsliders.append('svg:rect')
	.attr('class','filter')
	.attr('width',rectWidth)
	.attr('height',rectHeight)
	.style('fill','#fff')
	.style('stroke','#888')
	.on('mouseover',qMouseover)
	.on('mouseout',qMouseout)
	.on('mousedown',qMousedown)
	.on('mouseup',qMouseup)
	.on('click',qClick);
    qsliders.append('svg:text')
	.attr('class','filter')
	.text(function(d) { return "" + d.name; })
	.attr('x', -rectHeight)
	.attr('y', -rectHeight);
    qsliders.selectAll('text.label')
	.data(function(d) { return [d.min, d.max]; })
	.enter()
	.append('svg:text')
	.attr('class','label')
	.text(function(d) { return "" + d; })
	.attr('x', function(d,i) { return i==0?0:rectWidth;})
	.attr('y', textOffset)
	.attr('text-anchor',function(d,i) { return i==0?'start':'end'; });

    // Set up nominal sliders

    var nsliders = svg.selectAll('g.filter')
	.filter(function(d) { return d.type == "nominal"; });
    nsliders.selectAll('rect.nominalBox')
	.data(function(d) { return d.values; })
	.enter()
	.append('svg:rect')
	.attr('class','nominalBox')
	.attr('height',rectHeight)
	.attr('width',function(d) {
		var w = rectWidth / (d3.select(this.parentNode)
				     .node().__data__.values.length);
		return w - 2 * nomSpace;
	    })
	.attr('x',function(d, i) {
		var w = rectWidth / (d3.select(this.parentNode)
				     .node().__data__.values.length);
		return w * i + nomSpace;
	    })
	.style('fill','#fff')
	.style('stroke','#888')
	.on('mouseover',nMouseover)
	.on('mouseout',nMouseout)
	.on('mousedown',nMousedown)
	.on('mouseup',nMouseup)
	.on('click', nClick);

    nsliders.selectAll('text.label')
	.data(function(d) { return d.values; })
	.enter()
	.append('svg:text')
	.attr('class','label')
	.text(function(d) { return "" + d; })
	.attr('x', function(d,i) {
		var w = rectWidth / (d3.select(this.parentNode)
				     .node().__data__.values.length);
		return w * i + nomSpace;
	    })
	.attr('y', textOffset)
	.attr('text-anchor','start');
}

function calculatePaths()
{
    paths = [];
    var rectWidthNorm = 1.0 / rectWidth;

    for (var s = 0; s < 1000; s++) {
        var d = allData[s];
        paths[s] = [];

        var j = 0;
        for (var i = 0; i < filterKeys.length; i++) {
            var key = filterKeys[i];

            if (filterVals[i].type == "quantitative") {
                if (d[key] == "Not reported") continue;
                if (key == "faculty_to_student_ratio" && d[key] == null) continue;

                paths[s][j] = {y:i, x:filterVals[i].toPixel(d[key])*rectWidthNorm};
                j++;
            }
        }
    }
    console.log(paths[0]);
}

function mouseover(d)
{
    if (!dragging && lastHovered && lastHovered != this) {
	d3.select(lastHovered)
	    .style('stroke',strokeDefault);
    }
    lastHovered = this;
    d3.select(this).style('stroke',strokeHover);
}

function mouseout(d)
{
    if (!dragging && lastHovered) {
	d3.select(lastHovered)
	    .style('stroke',strokeDefault);
	lastHovered = undefined;
    }
}

function mousedown(d)
{
    //console.log("mousedown");
}

function mouseup(d)
{
    //console.log("mouseup");
    lastHandle = null;
    div.on('mousemoved',null);
}

function mousemoved(d)
{
    //console.log("mousemoved");
}

var qMouseover = mouseover,
    qMouseout = mouseout,
    qMousedown = mousedown,
    qMouseup = mouseup;

function qClick(d)
{
    var x = d3.svg.mouse(this.parentNode)[0];
    if (!currentFilter[d.key]) {
	var val = d.toPixel.invert(x);
	setFilterMinQuantitative(d.key, val);
	setFilterMaxQuantitative(d.key, val);
	var min = currentFilter[d.key].min,
	    max = currentFilter[d.key].max;

	var g = d3.select(this.parentNode);
	g.append('svg:rect')
	    .attr('class','slider')
	    .attr('height',rectHeight)
	    .attr('width',1)
	    .attr('x',x)
	    .style('stroke',strokeDefault)
	    .style('fill',fillSelected)
	    .call(sliderDrag)
	    .on('mouseover',qMouseover)
	    .on('mouseout',qMouseout);

	g.selectAll("rect.handle")
	    .data([d, d])
	    .enter().append('svg:rect')
	    .attr('class','handle')
	    .attr('height',rectHeight)
	    .attr('width',rectHeight)
	    .attr('x', function(d,i) {
		    return d.toPixel(getFilterQuantitative(d.key)[i])
			-rectHeight*.5;
		})
	    .attr('opacity',0.0)
	    .call(handleDrag);

	g.transition()
	    .duration(500)
	    .style('opacity',opacitySelected);
    }
}

var dragging = false;

var handleDrag = d3.behavior.drag()
    .on("dragstart",function(d) { dragging = true; })
    .on("drag",function(d,i) {
	    var dx = d.toPixel.invert(d3.event.dx);
	    var val = getFilterQuantitative(d.key);
	    if (i == 0) {
		setFilterMinQuantitative(d.key,val[0]+dx);
	    } else {
		setFilterMaxQuantitative(d.key,val[1]+dx);
	    }
	    qUpdateSlider(d3.select(this.parentNode), d);
	})
    .on("dragend",function(d) { dragging = false; mouseout(d); });

var sliderDrag = d3.behavior.drag()
    .on("dragstart",function(d) { dragging = true; })
    .on("drag",function(d) {
	    var dx = d.toPixel.invert(d3.event.dx);
	    var val = getFilterQuantitative(d.key);
	    setFilterMinQuantitative(d.key,val[0]+dx);
	    setFilterMaxQuantitative(d.key,val[1]+dx);
	    
	    qUpdateSlider(d3.select(this.parentNode), d);
	})
    .on("dragend",function(d) { dragging = false; mouseout(d); });

function qUpdateSlider(g, d)
{
    var val = getFilterQuantitative(d.key);
    g.select("rect.slider").attr('x', d.toPixel(val[0]))
	.attr('width', d.toPixel(val[1]-val[0])+1);
    g.selectAll("rect.handle")
	.attr('x', function(d,i) {
		return d.toPixel(val[i])-rectHeight*.5;
	    });
}

// Mouse handlers for nominal variables

var nMouseover = mouseover,
    nMouseout = mouseout,
    nMousedown = mousedown,
    nMouseup = mouseup;

var boolCheck = {}
function nClick(d)
{
    var key = d3.select(this.parentNode).node().__data__.key;
    var trans = !currentFilter[key];
    if (!boolCheck[key+d]) {
	boolCheck[key+d] = true;
	addFilterValueNominal(key, d);
	d3.select(this).style('fill',fillSelected);
    } else {
	boolCheck[key+d] = false;
	removeFilterValueNominal(key, d);
	console.log("removing");
	d3.select(this).style('fill',fillDefault);
    }

    if (trans) {
	d3.select(this.parentNode).transition()
	    .duration(500)
	    .style('opacity',opacitySelected);
    }
}

function filterMouseClick(d)
{
    var filter = d3.select(this.parentNode);
    console.log(filter.node().__data__);
    if (!selectedFilter || selectedFilter.node() != filter.node()) {
	console.log("new filter");
	if (selectedFilter) {
	    selectedFilter.select("rect")
		.style('fill','#fff')
		.style('stroke','#888');
	}
	selectedFilter = filter;
	selectedFilter.select("rect")
	    .style('fill','000')
	    .style('stroke','#000');
    }
}

// Redrawing callbacks

function redrawQuantitative(g, d)
{
    
}

// Transition Styles

function selectFilter()
{

}