<?php
require_once __DIR__."/../../controllers/Controller.php";
header('Content-Type: application/json');
$input = json_decode(file_get_contents("php://input"));

$controller = new Controller();
echo json_encode($controller->saveToDatabase($input));


