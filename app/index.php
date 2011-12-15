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
    <script type="text/javascript" src="js/jquery-ui.js"></script>
    <script type="text/javascript" src="js/jquery.tokeninput.js"></script>
    <script type="text/javascript" src="js/jquery.mousewheel.js"></script>
    <script type="text/javascript" src="js/jquery.jscrollpane.min.js"></script>
    <script type="text/javascript" src="js/jquery.ba-bbq.min.js"></script>

    <script type="text/javascript" src="js/d3/d3.js"></script>
    <script type="text/javascript" src="js/d3/d3.geo.js"></script>
    <script type="text/javascript" src="js/d3/d3.geom.js"></script>


    <script src="js/map_college_to_data_index.js"></script>
    <script src="js/script.js"></script>

    <script type="text/javascript">

      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-27701363-1']);
      _gaq.push(['_trackPageview']);

      (function() {
          var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
          ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
          var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();

    </script>


  </head>
  <body>

    <script type="text/javascript">

    </script>

    <div id="header">
      <div class="page">
        <div id="logo"><a href="/">uni<span id="vs">VS</span>ity</a></div>
        <div id="subtitle">
          A CS448B Project by
          Brie Bunge, Caleb Jordan, Megan Kanne, and Julia Neidert
        </div>
        <!-- TODO -->
        <div id="social">
          <a id="link" href="">Link</a>
          <a id="link_url" target="_blank" href="">http://google.com</a>
          <a id="share" href="">Share</a>
        </div>
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
        <div id="college_results"></div>

        <div id="college">
          <div id="college_details"></div>

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
            drawFilterChart("#filterChart", 630, 720);
            drawMap("#mapChart", .7);
            render_stars();

            read_url();

            /*var currentFilter = {
                "population":{"min":3000,"max":10000,"weight":0.5},
                "calendar":{"values":["Quarter"],"weight":0.5},
                "degrees":{"values":["Bachelor's","Doctoral"],"weight":0.5},
                };
            reloadFilter(currentFilter);*/
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
