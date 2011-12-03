<?php

  function print_json($x, $pretty = FALSE) {
    $json = json_encode($x);
    if ($pretty) {
      require_once('json_pretty_print.php');
      echo pretty_json($json);
    } else {
      echo $json;
    }
  }

  /* --- BEGIN DB FUNCTIONS --- */

  function get_db_conn() {
    $dbname = "../db/data.db";
    try {
      $db = new PDO("sqlite:" . $dbname);
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      return $db;
    } catch (PDOException $e) {
      echo "SQLite connection failed: " . $e->getMessage();
      exit();
    }
  }

  function db_update($query, $params) {
    try {
      $db = get_db_conn();
      $result = $db->prepare($query);
      $result->execute($params);
      $db = null;
      return true;
    } catch (PDOException $e) {
      //echo "query failed: \n".
      //echo "query: ".$query."\n";
      echo "Database Error: ".$e->getMessage();
      return null;
    }
  }

  function db_query($query, $fetch_all = TRUE, $params = NULL) {
    try {
      $db = get_db_conn();

      if ($params == NULL || count($params) == 0) {
        $result = $db->query($query);
      } else {
        $result = $db->prepare($query);
        $result->execute($params);
      }

      return $fetch_all ?
        $result->fetchAll(PDO::FETCH_ASSOC) :
        $result->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
      echo "query failed: \n".
      "query: ".$query."\n".
      "message: ".$e->getMessage();
      return null;
    }

    $db = null;
  }

  /* --- END DB FUNCTIONS --- */

?>
