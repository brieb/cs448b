var allData,
    passIndex,
    weightIndex,
    results,
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

var numFilter;
var currentFilter = {
    "population":{"min":3000,"max":10000,"weight":0.5},
    "degrees":{"values":["Bachelor's","Doctoral"],"weight":0.5},
    };

/*
 * Externals
 *
 * collegeSelectedInMap(d)
 */
    
// Callbacks to initialize all data and master filters and everything else

function loadFilter(json)
{
    filterVariables = json;
    filterMap = {};
    for (var i = 0; i < filterVariables.length; i++)
        filterMap[filterVariables[i].id] = i;
}

function loadData(json)
{
    allData = json;
    console.log("Loaded data for " + allData.length + " schools");
    
    //console.log(allData[0]);
    //allData.splice(10);

    currentFilter = {};
    numFilter = 0;
    weightIndex = [];
    
    for (var i = 0; i < allData.length; i++) {
        allData[i].pass = true;
        allData[i].weight = 1.0;
        weightIndex[i] = i;
    }
}

function reloadFilter(filter)
{
    currentFilter = filter;
    numFilter = 0;
    
    for (prop in currentFilter) {
        if (prop == "mapData") continue;
        
        numFilter += 1;
        var idx = filterMap[prop];
        if (filterVariables[idx].type == 'q') {
            enableQuantitativeFilter(prop);
        } else if (filterVariables[idx].type == 'n') {
            enableNominalFilter(prop);
        }
        setStarState(prop, currentFilter[prop].weight > 0.5 ? true : false);
    }
    
    if (currentFilter["mapData"] && currentFilter["mapData"].length > 0) {
        enableMapSelectors(currentFilter["mapData"]);
    }
    
    updateFilters();
}
    
// Callbacks to see if an individual data entry passes the current filter
// and if so, what its normed weight is

function updateIndex()
{   
    if ((selectedDataIdx >= 0) && !allData[selectedDataIdx].pass) {
        console.log(selectedDataIdx);
        selectData(-1);
    }

    for (var i = 0; i < allData.length; i++) {
        if (!allData[i].pass) {
            allData[i].weight = 0.0;
            continue;
        }
            
        allData[i].weight = getWeightedRank(allData[i]);
    }
    
    // Sort indices
    weightIndex.sort(function(a,b) {
        if (!allData[a].pass) return 1;
        return allData[b].weight - allData[a].weight;
    });
    
    passIndex = [];
    results = [];
    var r = 0;
    for (var i = 0; i < weightIndex.length; i++) {
        if (allData[weightIndex[i]].pass) {
            passIndex[r] = i;
            results[r++] = allData[weightIndex[i]];
        }
    }
    
    display_college_results(results, true);
    
    for (var i = 0; i < dataChangeListeners.length; i++)
        dataChangeListeners[i]();
}
    
function passesFilter(d)
{
    for (prop in currentFilter) {
        if (prop == "mapData") continue;
        if (!passOneFilter(d, prop)) return false;
    }
    if (!collegeSelectedInMap(d)) return false;
    
    return true;
}

function passOneFilter(d, prop)
{
    if (!currentFilter[prop]) return true;
    var idx = filterMap[prop];
    
    switch (filterVariables[idx].type) {
    case 'q': return passesQuantitative(d, prop);
    case 'n': return passesNominal(d, prop);
    case 'N':
        if (prop == "majors") {
            var res = school_has_majors(d);
            return (res === null || school_has_majors(d).num_majors > 0);
        } else if (prop == "name") {
            return school_has_name(d);
        } else {
            break;
        }
    default: return true;
    }
    
    return false;
}

function getWeightedRank(d)
{
    var sum = 0.0;
    for (prop in currentFilter) {
        if (prop == "mapData") continue;
        var idx = filterMap[prop];
        
        switch (filterVariables[idx].type) {
        case 'q':
            sum += weightQuantitative(d, prop);
            break;
        case 'n':
            sum += weightNominal(d, prop);
            break;
        case 'N':
            if (prop == "majors") {
                var res = school_has_majors(d);
                if (res === null) {
                  sum += 0;
                } else {
                  sum += res.num_majors / res.num_majors_specified;
                }
            }
            break;
        }
    }
    if (numFilter == 0) return 1.0;
    else return sum / numFilter;
}

// Filter change and callback info

var dataChangeListeners = [];
function addDataChangeCallback(call) {
    dataChangeListeners.push(call);
}

function updateFilters()
{
    for (var i = 0; i < allData.length; i++) {
        allData[i].pass = passesFilter(allData[i]);
    }
        
    updateIndex();
}

function contractFilter(prop)
{
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].pass == true && !passOneFilter(allData[i], prop)) {
            allData[i].pass = false;
        }
    }
    updateIndex();
}

function expandFilter(prop)
{
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].pass == false && passOneFilter(allData[i], prop) &&
                passesFilter(allData[i])) {
            allData[i].pass = true;
        }
    }
    updateIndex();
}

function updateMapFilter(sData)
{
    currentFilter["mapData"] = sData;
    var numPass = 0;
    for (var i = 0; i < allData.length; i++) {
        if (collegeSelectedInMap(allData[i]))
            numPass++;
        if (allData[i].pass && !collegeSelectedInMap(allData[i])) {
            allData[i].pass = false;
            //console.log("school ditched");
        } else if (!allData[i].pass && passesFilter(allData[i])) {
            allData[i].pass = true;
            //console.log("school added");
        }
    }
    updateIndex();
}

function setFilterStarred(prop, starred)
{
    setFilterWeight(prop, starred ? 1.0 : 0.5);
    updateIndex();
}

// Selection Callback Info

var selectedData, selectedDataIdx = -1;
    selectionListeners = [];
function selectData(idx, is_from_result_list)
{
    selectedDataIdx = idx;
    selectedData = (idx < 0 ? null : allData[idx]);
    for (var i = 0; i < selectionListeners.length; i++)
        selectionListeners[i](idx, is_from_result_list);
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
    var vals = currentFilter[prop].values;
            
    if (filterVariables[filterMap[prop]].multiple) {
        for (var i = 0; i < data[prop].length; i++) {
            if (vals.indexOf(data[prop][i]) != -1) return true;
        }
        return false;
    } else {
        if (vals.indexOf(data[prop]) != -1) return true;
        else return false;
    }
}

function passesQuantitative(data, prop)
{
    if (data[prop] === undefined || data[prop] === null) return passWithoutInfo;
    
    return (data[prop] >= currentFilter[prop].min &&
            data[prop] <= currentFilter[prop].max);
}

function weightNominal(data, prop)
{
    if (data[prop] === undefined || currentFilter[prop].values.length == 0)
        return 0.0;
    
    var vals = currentFilter[prop].values,
        sum = 0.0;
    
    
    if (filterVariables[filterMap[prop]].multiple) {
        for (var i = 0; i < data[prop].lengh; i++) {
            if (vals.indexOf(data[prop][i]) != -1) sum += 1.0;
        }
        sum /= vals.length;
    } else {
        if (vals.indexOf(data[prop]) != -1) sum += 1.0;
    }
    
    return currentFilter[prop].weight * sum;
}

function weightQuantitative(data, prop)
{
    var val = data[prop];
    if (val < 1.0 || val === null) return 0.0;
    
    var w, f = currentFilter[prop];
    if (val > f.pref) {
        w = (val - f.max) / (f.pref - f.max);
    } else {
        w = (val - f.min) / (f.pref - f.min);
    }
    
    w *= f.weight;
    return w;
}

// Functions for modifying and adding filters

function setFilterWeight(prop, weight)
{
    if (!currentFilter[prop]) {
        switch (filterVariables[filterMap[prop]].type) {
        case 'q':
            addFilterQuantitative(prop);
            enableQuantitativeFilter(prop);
            break;
        case 'n':
            addFilterNominal(prop);
            enableNominalFilter(prop);
            break;
        default: return;
        }
    }
    
    if (weight < 0.0) weight = 0.0;
    else if (weight > 1.0) weight = 1.0;
    
    currentFilter[prop].weight = weight;
}

function addFilterNominal(prop)
{
    currentFilter[prop] = FilterNominal(prop);
    numFilter++;
    contractFilter(prop);
}

function addFilterValueNominal(prop, val)
{
    var contract = false;
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterNominal(prop);
        numFilter++;
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
        numFilter--;
        expandFilter(prop);
        setStarState(prop, false);
        delete currentFilter[prop];
    } else {
        contractFilter(prop);
    }
    //console.log(currentFilter);
}

function addFilterQuantitative(prop)
{
    if (currentFilter[prop]) return;
    var idx = filterMap[prop];
    
    currentFilter[prop] = FilterQuantitative(prop);
    numFilter++;
    
    contractFilter(prop);
}

function removeFilterQuantitative(prop)
{
    if (!currentFilter[prop]) return;
    
    setStarState(prop,false);
    
    delete currentFilter[prop];
    expandFilter(prop);
}

function setFilterMinQuantitative(prop, val)
{
    var idx = filterMap[prop];
    
    var min0;
    
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterQuantitative(prop);
        numFilter++;
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
    
    var max0;
    
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterQuantitative(prop);
        numFilter++;
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

function setFilterPref(prop, val)
{
    var idx = filterMap[prop];
    
    if (!currentFilter[prop]) {
        currentFilter[prop] = FilterQuantitative(prop);
        numFilter++;
    }
    
    if (val > currentFilter[prop].max)
        val = currentFilter[prop].max;
    else if (val < currentFilter[prop].min)
        val = currentFilter[prop].min;
        
    currentFilter[prop].pref = val;
    
    updateIndex();
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
    return {"min":min,"max":max,"pref":(max+min)/2,"weight":defaultWeight};
}

function majorAdded()
{
    var res = school_has_majors(allData[0]);
    if (res.num_majors_specified == 1) {
        currentFilter["majors"] = true;
        contractFilter("majors");
    } else {
        expandFilter("majors");
    }
}

function majorRemoved()
{
    var res = school_has_majors(allData[0]);
    if (res === null) {
        expandFilter("majors");
        delete currentFilter["majors"];
    } else {
        contractFilter("majors");
    }
}

function nameAdded()
{
    if (num_school_names_specified() == 1) {
        currentFilter["name"] = true;
        contractFilter("name");
    } else {
        expandFilter("name");
    }
}

function nameRemoved()
{
    if (num_school_names_specified() == 0) {
        expandFilter("name");
        delete currentFilter["name"];
    } else {
        contractFilter("name");
    }
}

