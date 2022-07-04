$(window).on("load",function (){
    $("nav li:nth-child(3)").css("background-color", "#FFB933");

        navigator.geolocation.getCurrentPosition(success, error);


        function success(pos) {
            let myMap = setMap();
            ipInfoHTML();
            getMostVisitedPage();
            getCountryStats();
            getTimeZones();
            getGps(myMap);
        }

        function error() {
            $("#round h2").text("Pre zobrazenie informácie musíte povoliť zdieľanie polohy");

        }

});



function ipInfoHTML(){

    let request = new Request('https://api.ip2loc.com/QiADDNPVMi5VsElMZRyuxVfjPXzxYU3E/detect', {
        method: 'GET',
    });
    fetch(request)
        .then(response => response.json())
        .then(data => {
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
        "type": "statistika",
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

function getMostVisitedPage(){
    let request = new Request('api/getMostVisitedPage/', {
        method: 'GET',
    });
    fetch(request)
        .then(response => response.json())
        .then(data => {
            if(data === 'statistika')
                data = "Štatistika";
            else if(data === 'pocasie')
                data = "Počasie";
            else
                data = "IP Info";
            $("#most-visited-html").text(data);
        });
}

function getTimeZones(){
    let request = new Request('api/getTimeZone/', {
        method: 'GET',
    });
    fetch(request)
        .then(response => response.json())
        .then(data => {
            $("#time1").text(data[0]);
            $("#time2").text(data[1]);
            $("#time3").text(data[2]);
            $("#time4").text(data[3]);
        });
}


function getCountryStats(){
    let request = new Request('api/getCountryStats/', {
        method: 'GET',
    });
    fetch(request)
        .then(response => response.json())
        .then(data => {
            for(let i = 0; i<data.length; i++){
            let tr = document.createElement("tr");
            let td1 = document.createElement("td");
            let img = document.createElement("img");
            $(img).attr('width', 30);
            $(img).attr('height', 20);
            $(img).attr('src', 'https://www.geonames.org/flags/x/'+data[i].countryCode+'.gif');
            $(td1).append(img);
            let td2 = document.createElement("td");
            $(td2).text(data[i].country);
            $(td2).addClass("info-about-country");
            $(tr).on("click", () => showModal(data[i].cities, data[i].country));
            let td3 = document.createElement("td");
            $(td3).text(data[i].navstevnici);
            $(tr).append( td1, td2, td3);
            $("#country").append(tr);
            }

        });
}

function showModal(cities, country){
    $("#country-name").text(country);
    let tbody = $("#modal-body-table");
    tbody.empty();

    for(let i = 0; i<cities.length; i++){
        let tr = document.createElement("tr");
        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        $(td1).text(cities[i].obec);
        $(td2).text(cities[i].navstevnici);
        $(tr).append( td1, td2);
        $(tbody).append(tr);
    }

    $('#class-modal').modal({
        keyboard: false
    });
}


function setMap() {

    let mymap = L.map('mapid').setView([49.4079, 19.4803], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3Rhc2thdGthIiwiYSI6ImNrbzkweWhlbDBtd3YydXMydDk1OXd4aDYifQ.4DQxv1vGt3Pyd4E77gm3SQ', {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoic3Rhc2thdGthIiwiYSI6ImNrbzkweWhlbDBtd3YydXMydDk1OXd4aDYifQ.4DQxv1vGt3Pyd4E77gm3SQ'
    }).addTo(mymap);

    return mymap;
}


function getGps(myMap){
    let request = new Request('api/getGps/', {
        method: 'GET',
    });
    fetch(request)
        .then(response => response.json())
        .then(data => {
            printToMap(data, myMap);
        });
}

function printToMap(gps, myMap) {
    let markers = L.featureGroup();
    $.each(gps, function () {
        let coordinates = this;
        let marker = L.marker(coordinates).addTo(myMap);
        marker.addTo(markers);
    })
    myMap.fitBounds(markers.getBounds().pad(0.5));
}