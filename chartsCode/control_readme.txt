variables:

allData -- duplicate of json
filterData -- current schools passing filter

filterKeys -- array of all possible filter names
filterVariables -- map of all possible filters
{
  name, type (quantitative, nominal, ordinal), min, max, values (if nominal)
}

currentFilter -- map of all currently active filters
{
  min, max, weight, values (if nominal)
}

// Initialize allData
function loadData(json)

// Called internally--transforms variables (like 2:1 --> 2)
function transformData(data)

// Returns true if a given school passes the current filter
function passesFilter(school)

// Returns a calculated weight for a given school [0.0, 1.0]
function getWeightedRank(school)
