<?php

?>

<html>
  <head>
    <title>Parallel Colleges</title>

    <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300,700,800,600' rel='stylesheet' type='text/css'>

    <link rel="stylesheet" href="css/reset.css" />
    <link rel="stylesheet" href="css/token-input.css" type="text/css" />
    <link rel="stylesheet" href="css/token-input-facebook.css" type="text/css" />
    <link rel="stylesheet" href="css/style.css" />

    <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>
    <script type="text/javascript" src="js/jquery.tokeninput.js"></script>
    <script src="js/script.js"></script>
  </head>
  <body>

    <div id="header">
      <div class="page">
        <div id="logo">Parallel Colleges</div>
        <div id="subtitle">
          A CS448B Project by
          Brie Bunge, Caleb Jordan, Megan Kanne, and Julia Neidert
        </div>
        <!-- TODO -->
        <a id="share" href="mailto:?&subject=Shipping%20Information%20Request&body=Please%20tell%20me%20if%20my%20order%20has%20shipped!">Share</a>
      </div>
    </div>

    <div class="page">
      <div id="content_l">
        <div class="help">Filter by college name...</div>
        <input class="tok" id="tok_college" type="text"
        name="college" value="" />
        <div class="help">Filter by major...</div>
        <input class="tok" id="tok_major" type="text"
        name="major" value="" />

        <div id="pc">
        </div>
      </div>

      <div id="content_r">
        <div id="graph1" class="graph_small">
        </div>
        <div id="graph2" class="graph_small">
        </div>

        <div id="college">
          <div id="college_results"></div>
          <div id="college_details"></div>
        </div>

      </div>

    </div>

  </body>
</html>
