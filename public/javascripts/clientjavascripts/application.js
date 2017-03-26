/**
 * Created by ESSEL on 10-Mar-15.
 */

$(function () {
    //Id from the external users
    var MyID = 0;
    var socket = io.connect("/");
    var map;
    // get user name
    var username = document.getElementById("uname").value;
    //get userID
    var userId = document.getElementById("uID").value;
    var info = $("#infobox");
    var doc = $(document);

    // custom marker's icon styles
    var tinyIcon = L.Icon.extend({
        options: {
            shadowUrl: "../images/marker-shadow.png",
            iconSize: [25, 39],
            iconAnchor: [12, 36],
            shadowSize: [41, 41],
            shadowAnchor: [12, 38],
            popupAnchor: [0, -30]
        }
    });
    var redIcon = new tinyIcon({iconUrl: "../images/marker-red.png"});
    var yellowIcon = new tinyIcon({iconUrl: "../images/marker-yellow.png"});
    //Prepare an object to contain the data to be sent over to the socket server side
    var sentData = {}
    //connected users
    var connects = {};
    var markers = {};
    var active = false;


    // for loading user coordinates
    socket.on("load:coords", function (data) {
        // remember users id to show marker only once
        if (!(data.id in connects)) {
            setMarker(data);
        }
        connects[data.id] = data;
        connects[data.id].updated = $.now(); // shorthand for (new Date).getTime()
    });

    // check whether browser supports geolocation api
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(positionSuccess, positionError, {enableHighAccuracy: true});
    } else {
        $(".map").text("Sorry!your browser is not supported, there\'s no geolocation!");
    }

    function positionSuccess(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var acr = position.coords.accuracy;

        // mark user's position
        var userMarker = L.marker([lat, lng], {
            icon: redIcon
        });

        // load leaflet map
        map = L.map("map");

        // leaflet API key tiler
        L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
            maxZoom: 50,
            detectRetina: true
        }).addTo(map);

        // set map bounds
        map.fitWorld();
        userMarker.addTo(map);
        userMarker.bindPopup(username + " is here!").openPopup();
        userMarker.bind;
        userMarker.on('dblclick', doubleClick);

        // send coords on when user is active
        doc.on("mousemove", function () {
            active = true;

            sentData = {
                username: username,
                id: userId,
                active: active,
                coords: [{
                    lat: lat,
                    lng: lng,
                    acr: acr
                }]
            }
            socket.emit("send:coords", sentData);
        });
    }

    doc.bind("mouseup mouseleave", function () {
        active = false;
    });

    // showing markers for connections
//variable for other users
    var marker = '';

    function setMarker(data) {
        for (var i = 0; i < data.coords.length; i++) {
            marker = L.marker([data.coords[i].lat, data.coords[i].lng], {icon: yellowIcon}).addTo(map);
            marker.bindPopup(data.username + " is here!").openPopup();
            markers[data.id] = marker;
            MyID = data.id;
            marker.bind;
            marker.on('dblclick', doubleClick1);
        }

    }


    // handle geolocation api errors
    function positionError(error) {
        var errors = {
            1: "Authorization fails", // permission denied
            2: "Can\'t detect your location", //position unavailable
            3: "Connection timeout" // timeout
        };
        showError("Error:" + errors[error.code]);
    }

    function showError(msg) {
        info.addClass("error").text(msg);
    }

    //open message
    function doubleClick(e) {
        //allow customer to contact the person
        var host = location.protocol + '//' + location.host + '/Messages/' + userId;
        window.open(host, "_self");

    }

    function doubleClick1(e) {
        var host1 = location.protocol + '//' + location.host + '/Messages/' + MyID;
        window.open(host1, "_self");
    }

    // delete inactive users every 5 mins
    setInterval(function () {
        for (var ident in connects) {
            if ($.now() - connects[ident].updated > 15000) {
                delete connects[ident];
                map.removeLayer(markers[ident]);
            }
        }
    }, 300000);
});