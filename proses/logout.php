<?php

session_start();

$_SESSION = [];

session_destroy();

header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    "success" => true,
    "logged_in" => false
]);

exit;

?>