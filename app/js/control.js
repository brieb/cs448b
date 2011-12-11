var allData,
    filterData,
    defaultWeight = 0.5,
    passWithoutInfo = true;

var filterVariables = {
    "faculty_to_student_ratio":{"name":"Student to Faculty Ratio","type":"quantitative","min":0,"max":60},
    "num_grad":{"name":"Graduate Population","type":"quantitative","min":0,"max":25000},
    "num_undergrad":{"name":"Undergraduate Population","type":"quantitative","min":0,"max":80000},
    "percent_admitted":{"name":"Percent Admitted","type":"quantitative","min":0.0,"max":100.0},
    "degrees":{"name":"Degrees Offered","type":"nominal","values":["associates","bachelors","masters","doctorate"]},
    "majors":{"name":"Majors Offered","type":"nominal","values":["computer science", "mathematics", "physics",
    "english", "drama"]}
};

var filterKeys = Object.keys(filterVariables);

var currentFilter = {
    "num_undergrads":{"min":0,"max":40000,"weight":1.0},
    "degrees":{"values":["bachelors","doctorate"],"weight":0.5},
    "majors":{"values":["computer science", "mathematics", "physics"],"weight":1.0}
    };

/*
 * Externals
 *
 * collegeSelectedInMap(d)
 */
    
// Callbacks to initialize all data and master filters and everything else

function initializeTest()
{
    var school = {"id":"3387","name":"Stanford University",
        "url":"www.stanford.edu","address":"Stanford, CA 94305",
        "faculty_to_student_ratio":"6:1","num_grad":"12595",
        "num_undergrad":"6940","percent_admitted":"7","calendar":"Quarter"};

    for (prop in filterVariables) {
        console.log(FilterDefault(prop));
    }
}

var drawCharts;

function loadFilter(json, doneLoading)
{
    filterVariables = json;
    filterKeys = Object.keys(filterVariables);

    doneLoading();
}

function loadData(json)
{
    allData = json;
    
    transformData(allData);

    currentFilter = {};

    drawCharts();
}

function transformData(data)
{
    for (var i = 0; i < data.length; i++) {
	// Turn faculty to student ratio to numeric
	var fts = data[i].faculty_to_student_ratio;
	if (fts) {
	    var idx = fts.indexOf(':');
	    if (idx > 0) {
		var num = fts.substring(0,idx) / fts.substring(idx+1);
		data[i].faculty_to_student_ratio = num;
	    }
	}
    }
}
    
// Callbacks to see if an individual data entry passes the current filter
// and if so, what its normed weight is
    
function passesFilter(d)
{
    var passWithout = true;
    for (prop in currentFilter) {
        if (filterVariables[prop].type == "quantitative") {
            return passesQuantitative(d, prop);
        } else if (filterVariables[prop].type == "ordinal") {
            return passesOrdinal(d, prop);
        } else {
            return passesNominal(d, prop);
        }
    }
    
    return true;
}

function getWeightedRank(d)
{
    var sum = 0.0;
    for (prop in currentFilter) {
        if (filterVariables[prop].type == "quantitative") {
            sum += weightQuantitative(d, prop);
        } else if (filterVariables[prop].type == "ordinal") {
            sum += weightOrdinal(d, prop);
        } else {
            sum += weightNominal(d, prop);
        }
    }
    return sum / currentFilter.length;
}

// All of the support functions for different types of variables

function passesNominal(data, prop)
{
    if (currentFilter[prop].values.length == 0)
        return true;
        
    if (!data[prop]) return passWithoutInfo;
        
    for (val in data[prop].values) {
        if (currentFilter[prop].values.indexOf(val) != -1) return true;
    }
    return false;
}

function passesOrdinal(data, prop)
{
    if (!data[prop]) return passWithoutInfo;
    
    var idx = filterVariables[prop].values.indexOf(currentFilter[prop].min);
    var idxmax = filterVariables[prop].values.indexOf(currentFilter[prop].max);
    for (val in data[prop].values) {
        if (filterVariables[prop].values.indexOf(val) < idx ||
            filterVariables[prop].values.indexOf(val) > idxmax) return false;
    }
    return true;
}

function passesQuantitative(data, prop)
{
    if (!data[prop]) return passWithoutInfo;
    
    return (d[prop] >= currentFilter[prop].min &&
            d[prop] <= currentFilter[prop].max);
}

function weightNominal(data, prop)
{
    if (!data[prop] || currentFilter[prop].values.length == 0)
        return 0.0;
    var sum = 0.0;
    for (val in data[prop].values) {
        if (currentFilter[prop].values.indexOf(val) != -1) sum += 1.0;
    }
    return currentFilter[prop].weight * sum / currentFilter[prop].values.length;
}

function weightOrdinal(data, prop)
{
    if (!data[prop]) return 0.0;

    var idx = filterVariables[prop].values.indexOf(currentFilter[prop].min);
    var idxmax = filterVariables[prop].values.indexOf(currentFilter[prop].max);
    var sum = 0.0;
    for (val in data[prop].values) {
        if (filterVariables[prop].values.indexOf(val) >= idx &&
            filterVariables[prop].values.indexOf(val) <= idxmax) sum += 1.0;
    }
    return currentFilter[prop].weight * sum / (idxmax - idx + 1);
}

function weightQuantitative(data, prop)
{
    if (!data[prop]) return 0.0;
    
    var mid = (currentFilter[prop].max + currentFilter[prop].min) * .5;
    var range = (currentFilter[prop].max - currentFilter[prop].min) * .5;
    if (range == 0) return 1.0;
    return currentFilter[prop].weight * (1.0 - (Math.abs(data[prop] - mid) / range));
}

// Functions for modifying and adding filters

function setFilterWeight(prop, weight)
{
    if (!filterVariables[prop]) return;
    
    if (!currentFilter[prop]) {
        if (filterVariables[prop].type == "quantitative")
            currentFilter[prop] = FilterQuantitative(prop);
        else if (filterVariables[prop].type == "ordinal")
            currentFilter[prop] = FilterOrdinal(prop);
        else
            currentFilter[prop] = FilterNominal(prop);
    }
    
    if (weight < 0.0) weight = 0.0;
    else if (weight > 1.0) weight = 1.0;
    
    currentFilter[prop].weight = weight;
}

function addFilterValueNominal(prop, val)
{
    if (!filterVariables[prop] ||
        filterVariables[prop].values.indexOf(val) == -1)
        return;

    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterNominal(prop);
    }
    currentFilter[prop].values.push(val);
}

function removeFilterValueNominal(prop, val)
{
    if (!currentFilter[prop]) return;
    
    var idx = currentFilter[prop].values.indexOf(val);
    if (idx > -1) currentFilter[prop].values.splice(idx, 1);
}

function setFilterMinOrdinal(prop, val)
{
    if (!filterVariables[prop]) return;
    
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterOrdinal(prop);
    }
    var values = filterVariables[prop].values;
    
    var idx = values.indexOf(val);
    if (idx < 0) idx = 0;
    else if (idx >= values.length)
        idx = values.length - 1;
        
    currentFilter[prop].min = values[idx];
            
    var idxmax = values.indexOf(currentFilter[prop].max);
    if (idx > idxmax) {
        idxmax = idx;
        currentFilter[prop].max = values[idxmax];
    }
}

function setFilterMaxOrdinal(prop, val)
{
    if (!filterVariables[prop]) return;
    
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterOrdinal(prop);
    }
    var values = filterVariables[prop].values;
    
    var idx = values.indexOf(val);
    if (idx < 0) idx = 0;
    else if (idx >= values.length)
        idx = values.length - 1;
        
    currentFilter[prop].max = values[idx];
            
    var idxmin = values.indexOf(currentFilter[prop].min);
    if (idx < idxmax) {
        idxmax = idx;
        currentFilter[prop].min = values[idxmin];
    }
}

function setFilterMinQuantitative(prop, val)
{
    if (!filterVariables[prop]) return;
    
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterQuantitative(prop);
    }
    
    if (val > filterVariables[prop].max)
        val = filterVariables[prop].max;
    else if (val < filterVariables[prop].min)
        val = filterVariables[prop].min;
    currentFilter[prop].min = val;
    
    if (val > currentFilter[prop].max)
        currentFilter[prop].max = val;
}

function setFilterMaxQuantitative(prop, val)
{
    if (!filterVariables[prop]) return;
    
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterQuantitative(prop);
    }
    
    if (val > filterVariables[prop].max)
        val = filterVariables[prop].max;
    else if (val < filterVariables[prop].min)
        val = filterVariables[prop].min;
    currentFilter[prop].max = val;
    
    if (val < currentFilter[prop].min)
        currentFilter[prop].min = val;
}

function getFilterQuantitative(prop)
{
    if (currentFilter[prop]) {
	return [currentFilter[prop].min, currentFilter[prop].max];
    } else {
	return null;
    }
}

// Default Constructors

function FilterDefault(prop)
{
    if (filterVariables[prop]) {
        if (filterVariables[prop].type == "quantitative") {
            return FilterQuantitative(prop);
        } else if (filterVariables[prop].type == "ordinal") {
            return FilterOrdinal(prop);
        } else {
            return FilterNominal(prop);
        }
    } else return null;
}

function FilterNominal(prop)
{
    return {"values":[],"weight":defaultWeight};
}

function FilterOrdinal(prop)
{
    var min = filterVariables[prop].values[0];
    var max = filterVariables[prop].values[filterVariables[prop].values.length-1];
    return {"min":min,"max":max,"weight":defaultWeight};
}

function FilterQuantitative(prop)
{
    var min = filterVariables[prop].min;
    var max = filterVariables[prop].max;
    return {"min":min,"max":max,"weight":defaultWeight};
}