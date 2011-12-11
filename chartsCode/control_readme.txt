variables:

allData -- array of all schools

filterVariables -- array of all possible filters
{
  name, type (q, n, N), min, max, values (if n)
}

currentFilter -- object of all currently active filters
{
  min, max, weight, values (if nominal)
}

////// INITIALIZE allData //////

// Pass with a json object to init the filter
// Will call doneLoading() after complete
function loadFilter(json, doneLoading)

// Pass with a son object to init the school data
// Will call doneLoading() after complete
function loadData(json, doneLoading)

/////// CHANGE LISTENERS /////////

// Registers a function: callback(index) that is called
// when the 'pass' property of allData[index] is changed
function addDataChangeCallback(call)

// Registers a function: callback(index) that is called
// when allData[index] is selected
function addDataSelectionCallback(call)

// Notifies all selection listeners that allData[index]
// has been selected
function selectData(idx)

// Variable storing last selected data; equivalent to allData[lastSelectedData]
var selectedData;

///////////// TALKING TO THE FILTER ////////////

// Returns true if a given school passes the current filter
// calls collegeSelectedInMap
function passesFilter(school)

// Returns a calculated weight for a given school [0.0, 1.0]
function getWeightedRank(school)

// FROM MAP.JS
// returns true if the college is selected in the map, false otherwise
var collegeSelectedInMap = function(college) {}
