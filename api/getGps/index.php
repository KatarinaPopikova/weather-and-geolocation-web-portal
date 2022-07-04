<?php
require_once __DIR__ . "/../../controllers/Controller.php";
header('Content-Type: application/json');
$controller = new Controller();
echo json_encode($controller->getGPS());

