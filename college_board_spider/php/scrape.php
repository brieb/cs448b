<?php
  //$link = mysql_connect(
    //':/Applications/MAMP/tmp/mysql/mysql.sock',
    //'root',
    //'root'
    //);

    //mysql_select_db('cs448b');

    include('simple_html_dom.php');

    //$url = "http://collegesearch.collegeboard.com/search/CollegeDetail.jsp?collegeId=3387";
    $url = "http://localhost/cs448b/college_board_spider/php/dummy_data/College%20Search%20-%20Stanford%20University%20-%20The%20Farm%20-%20At%20a%20Glance.html";
    //$userAgent = 'Googlebot/2.1 (http://www.googlebot.com/bot.html)';


    $html = new simple_html_dom();
    $html->load_file($url);

    $address = $html->find('#main_address');
    $college_url = $address->find('a');
    echo $address->innertext;
    var_dump($college_url->plaintext);


    //foreach ($address as $e) {
      //var_dump($e);
    //}



    //$curl = curl_init($url);
    //curl_setopt($curl, CURLOPT_USERAGENT, $userAgent);
    //curl_setopt($curl, CURLOPT_AUTOREFERER, true);
    //curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
    //curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1 );
    //curl_setopt($curl, CURLOPT_TIMEOUT, 2 );

    //$html = curl_exec( $curl );

    //var_dump($html);

    ////$html = @mb_convert_encoding($html, 'HTML-ENTITIES', 'utf-8');

    //curl_close($curl);

    //$dom = new DOMDocument();

    //$dom->loadHTML($html);

    //$nodes = $dom->getElementsByTagName('*');

    //var_dump($nodes);



    //$sql = "
    //insert into college_board (
      //`address`,
      //`url`,
      //`school_type`,
      //`calendar`,
      //`degrees_offered`,
      //`setting`,
      //`num_undergrads`,
      //`num_grads`,
      //`student_faculty_ratio`,
      //`student_body`,
      //`admission_office`,
      //`acceptance_rate`,
      //`percent_soph_return`,
      //) values (
        //$address,
        //$url,
        //$school_type,
        //$calendar,
        //$degrees_offered,
        //$setting,
        //$num_undergrads,
        //$num_grads,
        //$student_faculty_ratio,
        //$student_body,
        //$admission_office,
        //$acceptance_rate,
        //$percent_soph_return,
        //)
        //";

        //mysql_query($sql);

        //mysql_close($link);


