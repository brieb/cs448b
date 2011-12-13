var div = d3.select('#filterChart'),
    width, height, rectWidth,
    xMarginLeft = 160.5,
    xMarginRight = 0,
    yMargin = 10.5,
    geoBuffer = 0,
    rectHeight = 20,
    nomSpace = 2.5,
    textOffset;

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

var paths, pathData, lastPath = -1;
var filterVals = [];
function initializeFilterVals()
{
    for (var i = 0; i < filterVariables.length; i++) {
        filterVals[i] = filterVariables[i];

        if (filterVals[i].type == "q") {
            if (filterVals[i].log == true) {
                filterVals[i].toPixel = d3.scale.log()
                    .domain([1, filterVals[i].max])
                    .range([0, rectWidth]);
            } else {
                filterVals[i].toPixel = d3.scale.linear()
                    .domain([filterVals[i].min, filterVals[i].max])
                    .range([0, rectWidth]);
            }
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
    height = h;
    rectWidth = width - xMarginLeft - xMarginRight;
    textOffset = rectHeight * .5 + 3;
    
    addDataChangeCallback(dataChange);
    addDataSelectionCallback(dataSelect);
    
    initializeFilterVals();

    var y = d3.scale.linear()
        .domain([0, filterVariables.length])
        .range([yMargin + geoBuffer, height - yMargin]);

    var x = d3.scale.linear()
        .domain([0, 1.0])
        .range([xMarginLeft, width - xMarginRight]);

    div.on('mouseup',mouseup)
        .on('mouseout',mouseup);
    
    var svg = div.append('svg:svg')
        .attr('width',width)
        .attr('height',height);

    // Set up paths
    
    calculatePaths();
    svg.append('svg:g')
        .attr('class', 'pathGroup');
    paths = svg.select('g.pathGroup').selectAll('path.pass')
        .data(pathData)
        .enter()
        .append('svg:path')
        .attr('class','pass')
        .attr('d', d3.svg.line()
              .x(function(d) { return x(d.x); })
              .y(function(d) { return y(d.y) + rectHeight * .5; }))
        .on('mouseover', function(d) {
            if (!dragging) d3.select(this).attr('class','hover');
        })
        .on('mouseout',function(d,idx) {
            if (lastPath != idx)
                d3.select(this).attr('class', allData[idx].pass == true ?
                        'pass' : 'fail');
        })
        .on('click',function(d,i) {
            selectData(i);
        });
    paths.append('svg:title')
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
    sliders.append('svg:text')
        .attr('class','filter')
        .text(function(d) { return "" + d.name; })
        .attr('x', -rectHeight)
        .attr('y', .5 *rectHeight);
        
    // Set up q boxes

    var qsliders = svg.selectAll('g.filter')
        .filter(function(d) { return d.type == "q"; });
    qsliders.append('svg:rect')
        .attr('class','filter')
        .attr('width',rectWidth)
        .attr('height',rectHeight)
        .style('fill','#fff')
        .style('fill-opacity',0.5)
        .style('stroke','#888')
        .on('mouseover',qMouseover)
        .on('mouseout',qMouseout)
        .on('mouseup',qMouseup)
        .on('click',qClickStart);
    qsliders.selectAll('text.label')
        .data(function(d) { 
            return [d.min, d.max]; })
        .enter()
        .append('svg:text')
        .attr('class','label')
        .text(function(d) { return d; })
        .attr('x', function(d,i) { return i == 0 ? 2 : rectWidth - 2;})
        .attr('y', textOffset)
        .attr('text-anchor',function(d,i) { return i==0?'start':'end'; });

    // Set up n sliders

    var nsliders = svg.selectAll('g.filter')
        .filter(function(d) { return d.type == "n"; });
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
            return w * i + nomSpace + 2;
            })
        .attr('y', textOffset)
        .attr('text-anchor','start');
}

function calculatePaths()
{
    pathData = [];
    var rectWidthNorm = 1.0 / rectWidth;

    for (var s = 0; s < allData.length; s++) {
        var d = allData[s];
        pathData[s] = [];
        pathData[s].idx = s;

        var j = 0;
        for (var i = 0; i < filterVals.length; i++) {
            var type = filterVals[i].type,
                key = filterVals[i].id;
            if (type == "q") {
                if (d[key] < 0.0) continue;

                var val = filterVals[i].log && d[key] == 0 ? 1 : d[key];
                
                pathData[s][j] = {y:i, x:filterVals[i].toPixel(val)*rectWidthNorm};
                j++;
            } else if (type == "n") {
                var val = filterVals[i].values.indexOf(d[key]);
                
                if (val < 0) continue;
                var num = filterVals[i].values.length;
            
                pathData[s][j] = {y:i, x:(val + .5)/num};
                j++;
            }
        }
    }
}

function dataChange(i)
{
    paths.attr('class', function(d,i) {
            if (i == lastPath) return 'select';
            else if (allData[i].pass) return 'pass';
            else return 'fail';
        })
        /*.style('stroke-opacity', function(d,i) {
            if (i == lastPath) return 1.0;
            else return allData[i].weight * .8 + .2;
        });*/
}

function dataSelect(i)
{
    if (lastPath >= 0) {
        d3.select(paths[0][lastPath]).attr('class',
            allData[lastPath].pass == true ? 'pass':'fail');
    }
    lastPath = i;
    d3.select(paths[0][i]).attr('class','select')
        .style('stroke-opacity',1.0);
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

}

var qMouseover = mouseover,
    qMouseout = mouseout,
    qMouseup = mouseup;

function qClickStart(d, i)
{
    if (!currentFilter[d.id]) {
        addFilterQuantitative(d.id);

        var g = d3.select(this.parentNode);
        g.append('svg:rect')
            .attr('class','slider')
            .attr('height',rectHeight)
            .attr('width',rectWidth)
            .attr('x',0)
            .style('stroke',strokeDefault)
            .style('fill',fillSelected)
            .style('fill-opacity', 0.5)
            .call(sliderDrag)
            .on('mouseover',qMouseover)
            .on('mouseout',qMouseout)
            .on('click',qClick);

        var h = g.selectAll("rect.handle")
            .data([d, d])
            .enter().append('svg:rect')
            .attr('class','handle')
            .attr('height',rectHeight)
            .attr('width',rectHeight)
            .attr('x', function(d,i) {
                return d.toPixel(getFilterQuantitative(d.id)[i])
                    -rectHeight*.5;
            })
            .attr('opacity',0.0)
            .call(handleDrag)

        g.transition()
            .duration(500)
            .style('opacity',opacitySelected);
    }
}

function qClick(d, i)
{
    var g = d3.select(this.parentNode);
    removeFilterQuantitative(d.id);
    g.selectAll('rect.handle')
        .remove();
    g.selectAll('rect.slider')
        .remove();
    g.transition()
        .duration(500)
        .style('opacity',opacityDefault);
}

var dragging = false;

var handleDrag = d3.behavior.drag()
    .on("dragstart",function(d) { dragging = true; })
    .on("drag",function(d,i) {
	    var dx = d3.event.dx;
        var slider = d3.select(this.parentNode).select("rect.slider");
        var minx = slider.attr('x') * 1.0,
            maxx = slider.attr('width') * 1.0 + minx;
        
        if (i == 0) {
            minx += dx * 1;
            if (minx < 0) minx = 0;
            else if (minx > maxx) minx = maxx;
        } else {
            maxx += dx * 1;
            if (maxx > rectWidth) maxx = rectWidth;
            else if (maxx < minx) maxx = minx;
        }
        
        qUpdateSlider(d3.select(this.parentNode), d, minx, maxx);
	})
    .on("dragend",function(d, i) {
        dragging = false;
        var slider = d3.select(this.parentNode).select("rect.slider");
        var minx = slider.attr('x') * 1.0,
            maxx = slider.attr('width') * 1.0 + minx;
        if (i == 0) {
            setFilterMinQuantitative(d.id, d.toPixel.invert(minx));
        } else
            setFilterMaxQuantitative(d.id, d.toPixel.invert(maxx));
    });

var sliderDrag = d3.behavior.drag()
    .on("dragstart",function(d) { dragging = true; })
    .on("drag",function(d) {
	    var dx = d3.event.dx;
        var slider = d3.select(this.parentNode).select("rect.slider");
        var minx = slider.attr('x') * 1.0 + dx,
            maxx = slider.attr('width') * 1.0 + minx;
        
        if (minx < 0) {
            maxx -= minx;
            minx = 0;
        } else if (maxx > rectWidth) {
            minx += (rectWidth - maxx);
            maxx = rectWidth;
        }
	    
	    qUpdateSlider(d3.select(this.parentNode), d, minx, maxx);
	})
    .on("dragend",function(d) { 
        dragging = false;
        var slider = d3.select(this.parentNode).select("rect.slider");
        var minx = slider.attr('x') * 1.0,
            maxx = slider.attr('width') * 1.0 + minx;
        console.log([d.toPixel.invert(minx), d.toPixel.invert(maxx)]);
        setFilterMinQuantitative(d.id, d.toPixel.invert(minx));
        setFilterMaxQuantitative(d.id, d.toPixel.invert(maxx));
        console.log(getFilterQuantitative(d.id));
    });

function qUpdateSlider(g, d, minx, maxx)
{
    g.select("rect.slider").attr('x', minx)
        .attr('width', maxx - minx);
    g.selectAll("rect.handle")
        .attr('x', function(d, i) {
            return (i == 0 ? minx : maxx) - rectHeight*.5;
        });
}

// Mouse handlers for n variables

var nMouseover = mouseover,
    nMouseout = mouseout,
    nMousedown = mousedown,
    nMouseup = mouseup;

var boolCheck = {}
function nClick(d)
{
    var key = d3.select(this.parentNode).node().__data__.id;
    var trans = !currentFilter[key];
    if (!boolCheck[key+d]) {
        boolCheck[key+d] = true;
        addFilterValueNominal(key, d);
        d3.select(this).style('fill',fillSelected);
    } else {
        boolCheck[key+d] = false;
        removeFilterValueNominal(key, d);
        d3.select(this).style('fill',fillDefault);
    }

    if (trans) {
        d3.select(this.parentNode).transition()
            .duration(500)
            .style('opacity',opacitySelected);
    } else if (!currentFilter[key]) {
        d3.select(this.parentNode).transition()
            .duration(500)
            .style('opacity',opacityDefault);
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