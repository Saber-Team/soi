<?php

function createFolder($path) {
    if (!file_exists($path)) {
        createFolder(dirname($path));
        mkdir($path, 0777);
    }
}

$path = urldecode($_POST["path"]);
$data = urldecode($_POST["data"]);
$dir = dirname($path);

// 创建目录
createFolder($dir);

// 写入文件
$file = fopen($path, "w+");
fwrite($file, $data);
fclose($file);