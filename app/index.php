<?php

?>

<html>
  <head>
    <title>uniVSity</title>

    <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300,700,800,600' rel='stylesheet' type='text/css'>

    <link rel="stylesheet" href="css/reset.css" />
    <link rel="stylesheet" href="css/token-input.css" type="text/css" />
    <link rel="stylesheet" href="css/token-input-facebook.css" type="text/css" />
    <link rel="stylesheet" href="css/jquery.jscrollpane.css" type="text/css" />
    <link rel="stylesheet" href="css/filter.css" />
    <link rel="stylesheet" href="css/charts.css" />
    <link rel="stylesheet" href="css/style.css" />

    <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>
    <script type="text/javascript" src="js/jquery.tokeninput.js"></script>
    <script type="text/javascript" src="js/jquery.mousewheel.js"></script>
    <script type="text/javascript" src="js/jquery.jscrollpane.min.js"></script>

  <script type="text/javascript" src="js/d3/d3.js"></script>
  <script type="text/javascript" src="js/d3/d3.geo.js"></script>
  <script type="text/javascript" src="js/d3/d3.geom.js"></script>


    <script src="js/script.js"></script>
  </head>
  <body>

    <script type="text/javascript">

    </script>

    <div id="header">
      <div class="page">
        <div id="logo">uni<span id="vs">VS</span>ity</div>
        <div id="subtitle">
          A CS448B Project by
          Brie Bunge, Caleb Jordan, Megan Kanne, and Julia Neidert
        </div>
        <!-- TODO -->
        <a id="share" href="">Share</a>
      </div>
    </div>

    <div class="page">
      <div id="content_l">

        <div id="c_tok_college">
          <div class="help">Filter by college name...</div>
          <input class="tok" id="tok_college" type="text"
          name="college" value="" />
        </div>

        <div id="c_tok_major">
          <div class="help">Filter by major...</div>
          <input class="tok" id="tok_major" type="text"
          name="major" value="" />
        </div>

        <div id="filterChart"></div>
      
        <div id="mapChart"></div>
      </div>

      <div id="content_r">
        <div class="dis_scroll_pane">
          <div id="college_results"></div>
        </div>

        <div id="college">
          <div class="dis_scroll_pane">
            <div id="college_details"></div>
          </div>

          <div id="graph1" class="graph_small">
          </div>
          <div id="graph2" class="graph_small">
          </div>
          <div id="graph3" class="graph_small">
          </div>

        </div>

      </div>

  <script type="text/javascript" src="js/control.js"></script>
  <script type="text/javascript" src="js/filterChart.js"></script>
  <script type="text/javascript" src="js/map.js"></script>
  <script type="text/javascript" src="js/demCharts.js"></script>
  <script type="text/javascript">
  
    // Everything to draw once loading is done
    var drawCharts = function() {
        drawFilterChart("#filterChart", 600, 600);
        drawMap("#mapChart", 0.6);
    }
  
    // Load filters then load data--uncomment once we have a filter json
    d3.json('filters.json', function(json) {
        loadFilter(json);
        
        d3.json('data.json', function(json) {
            loadData(json);
            
            drawCharts();
        });
    });

  </script>
    </body>
  </html>
