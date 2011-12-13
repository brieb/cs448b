var div = d3.select('#filterChart'),
    width, height, rectWidth,
    xMarginLeft = 170.5,
    xMarginRight = 0,
    yMargin = 10.5,
    geoBuffer = 0,
    rectHeight = 20,
    nomSpace = 2.5,
    textOffset,
    mapOffset = {x:0,y:0};

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

var paths, pathData, pathSelection, lastPath = -1,
    xScale, yScale;

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

function setParallelToMapOffset(xoff, yoff)
{
    mapOffset = {x:xoff, y:yoff};
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

    yScale = d3.scale.linear()
        .domain([0, filterVariables.length])
        .range([yMargin + geoBuffer, height - yMargin]);

    xScale = d3.scale.linear()
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
    pathSelection = svg.append('svg:g')
        .attr('class', 'pathSelection');
    paths = svg.select('g.pathGroup').selectAll('path.pass')
        .data(pathData)
        .enter()
        .append('svg:path')
        .attr('class','pass')
        .attr('d', d3.svg.line()
              .x(function(d) { return xScale(d.x); })
              .y(function(d) { return yScale(d.y) + rectHeight * .5; }))
        .on('mouseover', function(d) {
            if (!dragging) d3.select(this).attr('class','hover');
        })
        .on('mouseout',function(d) {
            if (lastPath != d.idx)
                d3.select(this).attr('class', allData[d.idx].pass == true ?
                        'pass' : 'fail');
        })
        .on('click',function(d,i) {
            selectData(d.idx);
        });
    paths.append('svg:title')
        .text(function(d,i) { return allData[i].name; });

    // Set up general g's

    var sliders = svg.selectAll('g.filter')
        .data(filterVals, function(d) { return d.name; })
        .enter().append('svg:g')
        .attr('class','filter')
        .attr('id',function(d,i) { return d.id; })
        .attr('transform',function(d,i) {
            return 'translate('+xMarginLeft+','+yScale(i)+')'})
        .classed('on', false)
        .classed('off', true)
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
        .attr('height',rectHeight);
    qsliders.selectAll('text.label')
        .data(function(d) { 
            return [(d.min_label ? d.min_label : d.min),
                (d.max_label ? d.max_label : d.max)]; })
        .enter()
        .append('svg:text')
        .attr('class','label')
        .text(function(d) { return d; })
        .attr('x', function(d,i) { return i == 0 ? 2 : rectWidth - 2;})
        .attr('y', textOffset)
        .attr('text-anchor',function(d,i) { return i==0?'start':'end'; });
    qsliders.append('svg:rect')
        .attr('class','selector')
        .attr('height',rectHeight)
        .attr('width',rectWidth)
        .on('mouseover',qMouseover)
        .on('mouseout',qMouseout)
        .on('mouseup',qMouseup)
        .on('click',qClickStart);

    // Set up n sliders

    var nsliders = svg.selectAll('g.filter')
        .filter(function(d) { return d.type == "n"; });
    nsliders.selectAll('rect.filter')
        .data(function(d) { return d.values; })
        .enter()
        .append('svg:rect')
        .attr('class','filter')
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
            });

    nsliders.selectAll('text.label')
        .data(function(d) { return d.value_labels ? d.value_labels : d.values; })
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
        
    nsliders.selectAll('rect.selector')
        .data(function(d) { return d.values; })
        .enter()
        .append('svg:rect')
        .attr('class','selector')
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
        .on('mouseover',nMouseover)
        .on('mouseout',nMouseout)
        .on('mousedown',nMousedown)
        .on('mouseup',nMouseup)
        .on('click', nClick);

    // Now do it
    
    dataChange();
}


function calculatePaths()
{
    pathData = [];
    var rectWidthNorm = 1.0 / rectWidth;

    for (var s = 0; s < allData.length; s++) {
        var d = allData[s];
        pathData[s] = [];
        pathData[s].idx = s;

        

        for (var i = 0; i < filterVals.length; i++) {
            var type = filterVals[i].type,
                key = filterVals[i].id;
            if (type == "q") {
                if (d[key] <= 0.0) continue;

                var val = filterVals[i].log && d[key] == 0 ? 1 : d[key];
                
                pathData[s].push({y:i, x:filterVals[i].toPixel(val)*rectWidthNorm});
            } else if (type == "n") {
                var val = filterVals[i].values.indexOf(d[key]);
                
                if (val < 0) continue;
                var num = filterVals[i].values.length;
            
                pathData[s].push({y:i, x:(val + .5)/num});
            } else if (type == "N") {
                if (key == "name") {
                    pathData[s].push({y:i, x:0.5});
                }
            }
        }
    }
}

var colorScale = d3.scale.linear()
    .domain([0,0.5,1])
    .range(['#333','#225599','#225599']);
var alphaScale = d3.scale.linear()
    .domain([0,0.5,1])
    .range([0.1,0.5,0.6]);
    
function dataChange()
{
    paths.attr('class', function(d,i) {
            return (allData[d.idx].pass ? 'pass' : 'fail');
        });
    /*paths.attr('stroke', function(d,i) {
            if (d.idx == lastPath || !allData[d.idx].pass) {
                return null;
            } else {
                var color = colorScale(allData[d.idx].weight);
                return color;
            }
        });
    paths.attr('opacity', function(d,i) {
            //console.log(allData[d.idx].weight);
            if (d.idx == lastPath || !allData[d.idx].pass) {
                return null;
            } else {
                return alphaScale(allData[d.idx].weight);
            }
        });*/
    paths.sort(function(a,b) {
        return allData[a.idx].weight - allData[b.idx].weight;
    });
}

function dataSelect(idx)
{
    var sel = pathSelection.selectAll("path")
        .data([pathData[idx]], function(d) { return d.idx; });
    sel.enter().append('svg:path')
        .attr('class','select')
        .attr('d', d3.svg.line()
              .x(function(d) { return xScale(d.x); })
              .y(function(d) { return yScale(d.y) + rectHeight * .5; }))
        .on('click', function(d) {
            selectData(d.idx);
        });
    sel.exit().remove();
}

function mouseover(d)
{
    if (!dragging) {
        if (!dragging && lastHovered && lastHovered != this) {
            d3.select(lastHovered)
                .style('stroke',null);
        }
        lastHovered = this;
        d3.select(this).style('stroke',strokeHover);
    }
}

function mouseout(d)
{
    if (!dragging && lastHovered) {
        d3.select(lastHovered)
            .style('stroke',null);
        lastHovered = undefined;
    }
}

function mousedown(d)
{

}

function mouseup(d)
{
    lastHandle = null;
}

var qMouseover = mouseover,
    qMouseout = mouseout,
    qMouseup = mouseup;

function qClickStart(d, i)
{
    if (!currentFilter[d.id]) {
        addFilterQuantitative(d.id);
        enableQuantitativeFilter(d.id);
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
    g.selectAll('circle.pref')
        .remove();
    g.transition()
        .duration(500)
        .style('opacity',opacityDefault);
    g.classed('on', false)
        .classed('off', true);
}

var dragging = false;

var handleDrag = d3.behavior.drag()
    .on("dragstart",function(d) { dragging = true; })
    .on("drag",function(d,i) {
	    var dx = d3.event.dx;
        var slider = d3.select(this.parentNode).select("rect.slider");
        var minx = slider.attr('x') * 1.0,
            maxx = slider.attr('width') * 1.0 + minx,
            prefx = d3.select(this.parentNode).select("circle.pref")
                .attr('cx') * 1.0;
        
        if (i == 0) {
            minx += dx * 1;
            if (minx < 0) minx = 0;
            else if (minx > maxx) minx = maxx;
        } else {
            maxx += dx * 1;
            if (maxx > rectWidth) maxx = rectWidth;
            else if (maxx < minx) maxx = minx;
        }
        
        if (prefx < minx) prefx = minx;
        if (prefx > maxx) prefx = maxx;
        
        qUpdateSlider(d3.select(this.parentNode), d, minx, maxx, prefx);
	})
    .on("dragend",function(d, i) {
        dragging = false;
        var slider = d3.select(this.parentNode).select("rect.slider");
        var minx = slider.attr('x') * 1.0,
            maxx = slider.attr('width') * 1.0 + minx,
            prefx = d3.select(this.parentNode).select("circle.pref")
                .attr('cx') * 1.0;
        if (i == 0) {
            setFilterMinQuantitative(d.id, d.toPixel.invert(minx));
        } else
            setFilterMaxQuantitative(d.id, d.toPixel.invert(maxx));
        setFilterPref(d.id, d.toPixel.invert(prefx));
    });

var sliderDrag = d3.behavior.drag()
    .on("dragstart",function(d) { dragging = true; })
    .on("drag",function(d) {
	    var dx = d3.event.dx;
        var slider = d3.select(this.parentNode).select("rect.slider");
        var minx = slider.attr('x') * 1.0 + dx,
            maxx = slider.attr('width') * 1.0 + minx,
            prefx = d3.select(this.parentNode).select("circle.pref")
                .attr('cx') * 1.0;
        
        if (minx < 0) {
            maxx -= minx;
            minx = 0;
        } else if (maxx > rectWidth) {
            minx += (rectWidth - maxx);
            maxx = rectWidth;
        }
        
        if (prefx < minx) prefx = minx;
        if (prefx > maxx) prefx = maxx;
	    
	    qUpdateSlider(d3.select(this.parentNode), d, minx, maxx, prefx);
	})
    .on("dragend",function(d) { 
        dragging = false;
        var slider = d3.select(this.parentNode).select("rect.slider");
        var minx = slider.attr('x') * 1.0,
            maxx = slider.attr('width') * 1.0 + minx,
            prefx = d3.select(this.parentNode).select("circle.pref")
                .attr('cx') * 1.0;
        setFilterMinQuantitative(d.id, d.toPixel.invert(minx));
        setFilterMaxQuantitative(d.id, d.toPixel.invert(maxx));
        setFilterPref(d.id, d.toPixel.invert(prefx));
    });
    
var prefDrag = d3.behavior.drag()
    .on("dragstart",function(d) { dragging = true; })
    .on("drag",function(d) {
        var dx = d3.event.dx;
        var slider = d3.select(this.parentNode).select("rect.slider");
        var minx = slider.attr('x') * 1.0,
            maxx = slider.attr('width') * 1.0 + minx,
            prefx = d3.select(this).attr('cx') * 1.0 + dx;
        
        if (prefx < minx) prefx = minx;
        if (prefx > maxx) prefx = maxx;
        
        qUpdateSlider(d3.select(this.parentNode), d, minx, maxx, prefx);
    })
    .on("dragend",function(d) {
        dragging = false;
        var prefx = d3.select(this).attr('cx') * 1.0;
        setFilterPref(d.id, d.toPixel.invert(prefx));
    });
        

function qUpdateSlider(g, d, minx, maxx, prefx)
{
    g.select("rect.slider").attr('x', minx)
        .attr('width', maxx - minx);
    g.selectAll("rect.handle")
        .attr('x', function(d, i) {
            return (i == 0 ? minx : maxx) - i * rectHeight + 1;
        });
    g.select("circle.pref").attr('cx', prefx);
}

// Mouse handlers for n variables

var nMouseover = mouseover,
    nMouseout = mouseout,
    nMousedown = mousedown,
    nMouseup = mouseup;

var boolCheck = {}
function nClick(d, i)
{
    var key = d3.select(this.parentNode).node().__data__.id;
    var trans = !currentFilter[key];
    if (!boolCheck[key+d]) {
        boolCheck[key+d] = true;
        addFilterValueNominal(key, d);
        d3.select(this.parentNode).selectAll('rect.filter')
            .filter(function(dother) {
                return dother == d;
            }).style('fill',fillSelected);
    } else {
        boolCheck[key+d] = false;
        removeFilterValueNominal(key, d);
        d3.select(this.parentNode).selectAll('rect.filter')
            .filter(function(dother) {
                return dother == d;
            }).style('fill',fillDefault);
    }

    if (trans) {
        d3.select(this.parentNode)
          .classed('off', false)
          .classed('on', true)
          .transition()
              .duration(500)
              .style('opacity',opacitySelected);
    } else if (!currentFilter[key]) {
        d3.select(this.parentNode)
          .classed('on', false)
          .classed('off', true)
          .transition()
            .duration(500)
            .style('opacity',opacityDefault);
    }
}

// Master filter enabling stuff

function enableQuantitativeFilter(propId)
{
    if (!currentFilter[propId]) return false;

    var g = d3.selectAll("g.filter").filter(function(d) {
        return d.id == propId; });
    var d = g.node().__data__;
    
    var vals = getFilterQuantitative(d.id),
        minx = d.toPixel(vals[0]),
        maxx = d.toPixel(vals[1]),
        prefx = d.toPixel(currentFilter[d.id].pref);
    
    g.append('svg:rect')
        .attr('class','slider')
        .attr('height',rectHeight)
        //.style('stroke',strokeDefault)
        .call(sliderDrag)
        .on('mouseover',qMouseover)
        .on('mouseout',qMouseout)
        .on('click',qClick);

    var h = g.selectAll("rect.handle")
        .data([d, d])
        .enter().append('svg:rect')
        .attr('class','handle')
        .attr('height',rectHeight-2)
        .attr('width',rectHeight-2)
        .attr('y',1)
        .on('mouseover',qMouseover)
        .on('mousout',qMouseout)
        .call(handleDrag);
        
    var s = g.selectAll("circle.pref")
        .data([d])
        .enter().append('svg:circle')
        .attr('class','pref')
        .attr('r',rectHeight * .3)
        .attr('cy', rectHeight * .5)
        .call(prefDrag)
        .on('mouseover',qMouseover)
        .on('mouseout',qMouseout);
        
    qUpdateSlider(g, d, minx, maxx, prefx);

    g.transition()
        .duration(500)
        .style('opacity',opacitySelected);

    g.classed('off', false)
      .classed('on', true);
}

function enableNominalFilter(propId)
{
    if (!currentFilter[propId]) return false;

    var g = d3.selectAll("g.filter").filter(function(d) {
        return d.id == propId; });
    var d = g.node().__data__;
    
    var vals = currentFilter[propId].values;
    var key = d.id;
    
    for (var i = 0; i < vals.length; i++) {
        boolCheck[key + vals[i]] = true;
    }
    g.selectAll('rect.filter')
        .filter(function(oKey) {
            return vals.indexOf(oKey) != -1;
        })
        .style('fill', fillSelected);
    
    g.transition()
        .duration(500)
        .style('opacity',opacitySelected);

    g.classed('off', false)
      .classed('on', true);
}
