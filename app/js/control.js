var allData,
    filterData,
    defaultWeight = 0.5,
    passWithoutInfo = false;

var filterVariables = [
    {id:"faculty_to_student_ratio",name:"Student to Faculty Ratio",type:"q",min:0,max:60},
    {id:"num_grad",name:"Graduate Population",type:"q",min:0,max:32000,log:false},
    {id:"num_undergrad",name:"Undergraduate Population",type:"q",min:0,max:80000,log:false},
    {id:"percent_admitted",name:"Percent Admitted",type:"q",min:0.0,max:100.0},
    {id:"degrees",name:"Degrees Offered",type:"n",values:["associates","bachelors","masters","doctorate"]},
    {id:"majors",name:"Majors Offered",type:"N"}
];
var filterMap = {};
for (var i = 0; i < filterVariables.length; i++)
    filterMap[filterVariables[i].id] = i;

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

function loadFilter(json)
{
    //filterVariables = json;
    //filterKeys = Object.keys(filterVariables);
}

function loadData(json)
{
    allData = json;
    
    //allData.splice(10);
    
    transformData(allData);

    currentFilter = {};
    
    for (var i = 0; i < allData.length; i++) {
        allData[i].pass = true;
        allData[i].weight = 0.0;
    }
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
        } else {
            data[i].faculty_to_student_ratio = -1;
        }
        
        for (var j = 0; j < filterVariables.length; j++) {
            var key = filterVariables[j].id;
            if (filterVariables[j].type == 'q') {
                if (data[i][key] === undefined ||
                    data[i][key] == "Not reported")
                    data[i][key] = -1.0;
                if (data[i][key] === null)
                    data[i][key] = 0.0;
            }
        }
    }
}
    
// Callbacks to see if an individual data entry passes the current filter
// and if so, what its normed weight is
    
function passesFilter(d)
{
    for (prop in currentFilter) {
        if (!passOneFilter(d, prop)) return false;
    }
    if (!collegeSelectedInMap(d)) return false;
    
    return true;
}

function passOneFilter(d, prop)
{
    var idx = filterMap[prop];
    if (filterVariables[idx].type == 'q') {
        return passesQuantitative(d, prop);
    } else if (filterVariables[idx].type == 'n') {
        return passesNominal(d, prop);
    }
}

function getWeightedRank(d)
{
    var sum = 0.0;
    for (prop in currentFilter) {
        if (filterVariables[prop].type == "q") {
            sum += weightQuantitative(d, prop);
        } else if (filterVariables[prop].type == 'n') {
            sum += weightNominal(d, prop);
        }
    }
    return sum / currentFilter.length;
}

// Filter change and callback info

var dataChangeListeners = [];
function addDataChangeCallback(call) {
    dataChangeListeners.push(call);
}

function contractFilter(prop)
{
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].pass == true && !passOneFilter(allData[i], prop)) {
            allData[i].pass = false;
            for (var j = 0; j < dataChangeListeners.length; j++)
                dataChangeListeners[j](i);
        }
    }
}

function expandFilter(prop)
{
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].pass == false && passOneFilter(allData[i], prop) &&
                passesFilter(allData[i])) {
            allData[i].pass = true;
            for (var j = 0; j < dataChangeListeners.length; j++)
                dataChangeListeners[j](i);
        }
    }
}

// Selection Callback Info

var selectedData,
    selectionListeners = [];
function selectData(idx)
{
    selectedData = allData[idx];
    console.log(selectedData.name);
    for (var i = 0; i < selectionListeners.length; i++)
        selectionListeners[i](idx);
}

function addDataSelectionCallback(call) {
    selectionListeners.push(call);
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

function passesQuantitative(data, prop)
{
    if (data[prop] < -1.0) return passWithoutInfo;
    
    return (data[prop] >= currentFilter[prop].min &&
            data[prop] <= currentFilter[prop].max);
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

function weightQuantitative(data, prop)
{
    if (data[prop] < 1.0) return 0.0;
    
    var mid = (currentFilter[prop].max + currentFilter[prop].min) * .5;
    var range = (currentFilter[prop].max - currentFilter[prop].min) * .5;
    if (range == 0) return 1.0;
    return currentFilter[prop].weight * (1.0 - (Math.abs(data[prop] - mid) / range));
}

// Functions for modifying and adding filters

function setFilterWeight(prop, weight)
{
    var idx = filterMap[prop];
    if (!filterVariables[idx]) return;
    
    if (!currentFilter[prop]) {
        if (filterVariables[idx].type == "q")
            currentFilter[prop] = FilterQuantitative(prop);
        else if (filterVariables[idx].type == "o")
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
    if (!filterVariables[prop])
        return;

    var contract = false;
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterNominal(prop);
        contract = true;
    }
    currentFilter[prop].values.push(val);
    
    if (contract) contractFilter(prop)
    else expandFilter(prop);
}

function removeFilterValueNominal(prop, val)
{
    if (!currentFilter[prop]) return;
    
    var vals = currentFilter[prop].values;
    var idx = vals.indexOf(val);
    if (idx > -1) vals.splice(idx, 1);
    
    if (vals.length == 0) {
        expandFilter(prop);
        currentFilter[prop] = undefined;
    } else contractFilter(prop);
}

function setFilterMinQuantitative(prop, val)
{
    var idx = filterMap[prop];
    if (!filterVariables[idx]) return;
    
    var min0;
    
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterQuantitative(prop);
        min0 = -1.0;
    } else {
        min0 = currentFilter[prop].min;
    }
    
    if (val > filterVariables[idx].max)
        val = filterVariables[idx].max;
    else if (val < filterVariables[idx].min)
        val = filterVariables[idx].min;
    currentFilter[prop].min = val;
    
    if (val > currentFilter[prop].max)
        currentFilter[prop].max = val;
        
    if (min0 < val) contractFilter(prop);
    else if (min0 > val) expandFilter(prop);
}

function setFilterMaxQuantitative(prop, val)
{
    var idx = filterMap[prop];
    if (!filterVariables[idx]) return;
    
    var max0;
    
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterQuantitative(prop);
        max0 = currentFilter[prop].max + 1.0;
    } else {
        max0 = currentFilter[prop].max;
    }
    
    if (val > filterVariables[idx].max)
        val = filterVariables[idx].max;
    else if (val < filterVariables[idx].min)
        val = filterVariables[idx].min;
    currentFilter[prop].max = val;
    
    if (val < currentFilter[prop].min)
        currentFilter[prop].min = val;
        
    if (max0 > val) contractFilter(prop);
    else if (max0 < val) expandFilter(prop);
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
    var idx = filterMap[prop];
    if (filterVariables[idx].type == "q") {
        return FilterQuantitative(prop);
    } else {
        return FilterNominal(prop);
    }
}

function FilterNominal(prop)
{
    return {"values":[],"weight":defaultWeight};
}

function FilterQuantitative(prop)
{
    var min = filterVariables[filterMap[prop]].min;
    var max = filterVariables[filterMap[prop]].max;
    return {"min":min,"max":max,"weight":defaultWeight};
}