$(window).on("load",function (){
    $("nav li:nth-child(2)").css("background-color", "#FFB933");

    navigator.geolocation.getCurrentPosition(success, error);


    function success(pos) {
        $("#info").hide();
        ipInfoHTML();
    }

    function error() {
        let info = $("#info");
        info.show();
        info.text("Pre zobrazenie informácie musíte povoliť zdieľanie polohy");

    }



});

function ipInfoHTML(){

    let request = new Request('https://api.ip2loc.com/QiADDNPVMi5VsElMZRyuxVfjPXzxYU3E/detect', {
        method: 'GET',
    });
    fetch(request)
        .then(response => response.json())
        .then(data => {

            $("#ip-address").text(data.connection.ip);
            $("#position-data").text(data.location.latitude +", " + data.location.longitude);
            $("#village").text(data.location.city);
            $("#capital-city").text(data.location.capital);
            $("#country-ip").text(data.location.country.name);
            saveData(data);
        });
}

function saveData(data){
    let date = new Date();
    let dataToSave = {
        "ipAddress": data.connection.ip,
        "latitude": data.location.latitude,
        "longitude":  data.location.longitude,
        "country": data.location.country.name,
        "city": data.location.city,
        "countryCode":data.location.country.alpha_2,
        "type": "ipInfo",
        "time": Date.now()/1000 - date.getTimezoneOffset()*60
    }

    let request = new Request('api/saveData/', {
        method: 'POST',
        body: JSON.stringify(dataToSave)
    });
    fetch(request)
        .then(response => response.json())
        .then(data => {

        });
}