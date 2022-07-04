<?php
require_once __DIR__."/../helpers/Database.php";

class Controller
{
    private PDO $conn;
    private array $response;
    /**
     * Controller constructor.
     * @param $conn
     */
    public function __construct(){
        $database = new Database();
        $this->conn = $database->getConn();
    }

    public function saveToDatabase($input): array
    {
        $date = date("Y-m-d", intval($input->time));
        $time = date("H:i:s", intval($input->time));

        $stmt = $this->conn->prepare("INSERT INTO ip (stranka,ip_adresa, suradnice_x, suradnice_y, stat, statKod, obec, datum, cas)
                                        VALUES (:type,:ipAddress,:latitude,:longitude,:country,:countryCode,:city,:date, :time )");
        $stmt->bindValue(":ipAddress", $input->ipAddress, PDO::PARAM_STR);
        $stmt->bindValue(":latitude", $input->latitude, PDO::PARAM_STR);
        $stmt->bindValue(":longitude", $input->longitude, PDO::PARAM_STR);
        $stmt->bindValue(":country", $input->country, PDO::PARAM_STR);
        $stmt->bindValue(":city", $input->city, PDO::PARAM_STR);
        $stmt->bindValue(":countryCode", $input->countryCode, PDO::PARAM_STR);
        $stmt->bindValue(":type", $input->type, PDO::PARAM_STR);
        $stmt->bindValue(":date", $date, PDO::PARAM_STR);
        $stmt->bindValue(":time", $time, PDO::PARAM_STR);

        try{
            $stmt->execute();
            return array(
                "error"=>false,
                "status"=>"success",
                "insertedId"=> $this->conn->lastInsertId()
                );
        }catch (PDOException $e){
            return array(
                "error"=>true,
                "status"=>"failed",
                "error-message"=>$e->getMessage()
            );
        }
    }


    public function getCountryStats(): array
    {
        $countries = $this->getCountries();
        $response = array();
        foreach ($countries as $country){
            $cities = $this->getCities($country["stat"]);
            array_push($response,array(
                "country"=>$country["stat"],
                "countryCode"=>strtolower($country["statKod"]),
                "cities"=> $cities,
                "navstevnici"=> $this->getNastevniciPocet($cities),
                ));
        }
        return $response;
    }

    private function getNastevniciPocet($cities){
        $navstevnici = 0;
        foreach ($cities as $city)
            $navstevnici += intval($city["navstevnici"]);
        return $navstevnici;
    }

    private function getCities($country){
        $stmt = $this->conn->prepare("SELECT obec, COUNT(*) AS navstevnici FROM(SELECT datum, obec, ip_adresa FROM ip
                                                             WHERE stat = :country
                                                             GROUP BY  datum, obec, ip_adresa) AS pocet
                                                             GROUP BY obec");

        $stmt->bindValue(":country",$country,PDO::PARAM_STR);

        $stmt->execute();
        return  $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getCountries(): array
    {
        $stmt = $this->conn->prepare("SELECT DISTINCT stat, statKod FROM ip");

        $stmt->execute();
        $stmt->setFetchMode(PDO::FETCH_ASSOC);

        return  $stmt->fetchAll();
    }

    public function getMostVisitedPage(){
        $stmt = $this->conn->prepare("SELECT stranka FROM `ip` GROUP BY stranka ORDER BY COUNT(id) DESC LIMIT 1");

        $stmt->execute();
        return  $stmt->fetchColumn();
    }


    public function getTime(): array
    {
        return array(
            0 =>  $this->getTimeFromDatabase('00:00:00','05:59:59'),
            1 => $this->getTimeFromDatabase('06:00:00','14:59:59'),
            2 => $this->getTimeFromDatabase('15:00:00','20:59:59'),
            3 => $this->getTimeFromDatabase('21:00:00','23:59:59')
        );
    }

    public function getTimeFromDatabase($fromTime, $toTime) {
        $stmt = $this->conn->prepare("SELECT COUNT(cas) AS 'pocet' FROM `ip` WHERE cas BETWEEN :fromTime AND :toTime");
        $stmt->bindValue(":fromTime",$fromTime,PDO::PARAM_STR);
        $stmt->bindValue(":toTime",$toTime,PDO::PARAM_STR);
        $stmt->execute();
        return  $stmt->fetchColumn();
    }

    public function getGPS(): array
    {
        $stmt = $this->conn->prepare("SELECT DISTINCT suradnice_x, suradnice_y FROM ip");

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_NUM);

    }

    /**
     * @return mixed|PDO
     */
    public function getConn()
    {
        return $this->conn;
    }

    /**
     * @param mixed|PDO $conn
     */
    public function setConn($conn)
    {
        $this->conn = $conn;
    }

    /**
     * @return array
     */
    public function getResponse()
    {
        return $this->response;
    }

    /**
     * @param array $response
     */
    public function setResponse($response)
    {
        $this->response = $response;
    }

}


