<?php

  $path = $_POST["path"];
  $data = $_POST["data"];

  try {
      $myfile = fopen($path, "w") or die("Unable to open file!");
      fwrite($myfile, $data);
      fclose($myfile);

      echo "Success!"
  } catch (err) {
      echo "Error!"
  }

?>