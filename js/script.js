$(window).on("load",function (){
    $("nav li:nth-child(1)").css("background-color", "#FFB933");


    navigator.geolocation.getCurrentPosition(success, error);


    function success() {
        weatherHTML();
    }

    function error() {
        $("#degrees").text("Pre zobrazenie informácie musíte povoliť zdieľanie polohy");

    }


});



function weatherHTML(){

    let request = new Request('https://api.ip2loc.com/QiADDNPVMi5VsElMZRyuxVfjPXzxYU3E/detect', {
        method: 'GET',
    });
    fetch(request)
        .then(response => response.json())
        .then(data => {
            saveData(data);
            weatherLoad(data.location.city, data.location.capital);
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
        "type": "pocasie",
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

function weatherLoad(city, capital) {
        let request = new Request('https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=metric&appid=c48ee779586f5ae88a69dc6ac179f316', {
            method: 'GET',
        });
    fetch(request)
        .then(response => response.json())
        .then(data => {
            if(data.name){
            $("#icon").attr("src", 'https://openweathermap.org/img/wn/' +data.weather[0].icon+'.png') ;
            $("#village-name").text(data.name);
            $("#degrees").text(data.main.temp+"°C");}
        else{
        $("#village-name").text("Nemožno nájsť pre vašu lokáciu teplotu");

    }
        });
}


