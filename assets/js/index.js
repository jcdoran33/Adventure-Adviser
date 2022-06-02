//global variables
//var for the location search field input
var searchField = document.querySelector("#location");
//var to store the google maps api link
var googleMapsGeocodeApiLink = "https://maps.googleapis.com/maps/api/geocode/json?address=";
var googleMapsGeocodeApiKey = "&key=AIzaSyBmUtkPFIztrMVdAlGTxNO8Tl8xKMV2xbg";
var ticketMasterApiLink = "https://app.ticketmaster.com/discovery/v2/events.json?sort=distance,date,asc&startDateTime=2022-06-01T00:00:00Z&apikey=x56DhoGzGuOrvXlzCq3OZhliv6STUrh3&latlong=";
// og ticketmaster URL https://app.ticketmaster.com/discovery/v2/events.json?apikey=x56DhoGzGuOrvXlzCq3OZhliv6STUrh3&latlong=

var map = document.getElementById("map");

//comment out this function 
// function getLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(showPosition, showError);
//     } else {
//         var x = document.getElementById("location");
//         x.innerHTML = "Geolocation is not supported by this browser.";
//     }
// }

//creating alternate getLocation function that gets user location from search input instead of brower's location
//step1 - convert user search input to lat/lng coordinates

function getLocation () {
  $("#submit-button").click(function(event) {
    event.preventDefault();
    var userSearchLocation = searchField.value;
    console.log(userSearchLocation);
    //pass into geocode API
    //first convert user search into format that works for URL - convert space to %20
    var locationUrlString = userSearchLocation.replace(" ", "%20");
    //now new variable for complete URL
    var completeUrlStringG = googleMapsGeocodeApiLink + locationUrlString + googleMapsGeocodeApiKey
    console.log(completeUrlStringG);
    apiFetchGeo(completeUrlStringG)
  })
};

function apiFetchGeo (completeUrlStringG) {
  fetch(completeUrlStringG)
    .then(function(res) {
      return res.json()
    })
    .then(function(data) {
      console.log(data)
      var gLatitude = data.results[0].geometry.location.lat;
      var gLongitude = data.results[0].geometry.location.lng;
      console.log(gLatitude);
      console.log(gLongitude);
      var latlon = gLatitude + "," + gLongitude
      console.log(latlon);
      apiFetchTm(latlon);
      showMap(gLatitude, gLongitude);
    })
};

// step 2 - pass the coordinates into the ticketmaster API (showevents, addMarker, showPosition?, )
function apiFetchTm (latlon) {
  //first create new URL string that adds in the latlon coordinates
  var completeUrlStringTm = ticketMasterApiLink + latlon;
  console.log(completeUrlStringTm);
  //now fetch form ticketmaster api
  fetch(completeUrlStringTm)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    console.log(data);
    updateEventList(data);
    placeMarkers(data);
  })
};

function updateEventList (data) {
  //want to update each event item in the list with the top event results (use for loop)
  for (var i = 0 ; i < 20; i++) {
    console.log("For loop run # " + i)
    $("#events").children("ul").children("li").eq(i).html(data._embedded.events[i].name + " at " + data._embedded.events[i]._embedded.venues[0].name + " || " + data._embedded.events[i].dates.start.localDate + " || Start time: " + data._embedded.events[i].dates.start.localTime + " || <a href='"+data._embedded.events[i].url+"' target='_blank'>Ticket Link</a>")
    console.log (data._embedded.events[i].name)
  }
  //removed show map from here
};


function showPosition(position) {
    var x = document.getElementById("location");
    x.innerHTML = "Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude; 
    var latlon = position.coords.latitude + "," + position.coords.longitude;


    $.ajax({
      type:"GET",
      url:"https://app.ticketmaster.com/discovery/v2/events.json?apikey=x56DhoGzGuOrvXlzCq3OZhliv6STUrh3&latlong="+latlon,
      async:true,
      dataType: "json",
      success: function(json) {
                  console.log(json);
                  var e = document.getElementById("events");
                  e.innerHTML = json.page.totalElements + " events found.";
                  showEvents(json);
                  initMap(position, json);
               },
      error: function(xhr, status, err) {
                  console.log(err);
               }
    });

}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}


function showEvents(json) {
  for(var i=0; i<json.page.size; i++) {
    $("#events").append("<p>"+json._embedded.events[i].name+"</p>");
  }
}

// Jack's copy of the initMap function
function showMap(gLatitude, gLongitude) {
  console.log(gLatitude, gLongitude);
  var mapDiv = document.querySelector("#map");
  var map = new google.maps.Map( mapDiv, {
    center: {lat: gLatitude, lng: gLongitude},
    zoom: 10
  });
  
  new google.maps.Marker({
    position: {lat: gLatitude, lng: gLongitude},
    map,
    title: "Hello extra test!"
  })
}

//moving this loop out of the showMap function
//creating new function to replace others (addMarker)
function placeMarkers(data) {
  console.log("placeMarkers");
  var mapDiv = document.querySelector("#map");
  var map = new google.maps.Map( mapDiv, {
    center: {lat: JSON.parse(data._embedded.events[0]._embedded.venues[0].location.latitude), lng: JSON.parse(data._embedded.events[0]._embedded.venues[0].location.longitude)},
    zoom: 10
  });

  for (var i = 0; i < 20; i++) {
    console.log("Marker loop run # " + i);
    console.log(data._embedded.events[i]);
    // var myLatLng = {lat: data._embedded.events[i]._embedded.venues[0].location.latitude, lng: data._embedded.events[i]._embedded.venues[0].location.longitude};
    var myLatLng = {lat: JSON.parse(data._embedded.events[i]._embedded.venues[0].location.latitude), lng: JSON.parse(data._embedded.events[i]._embedded.venues[0].location.longitude)};
    console.log(myLatLng);
    console.log("Venue: ", data._embedded.events[i]._embedded.venues)
    // var map = document.getElementById("map");
  
  new google.maps.Marker({
    position: myLatLng,
    map,
    title: "Hello test!"
  })
    // marker.setMap(map) // this is not working
  }
};

//comment out old function initMap (replaced by our custom function above)
// function initMap(position, json) {
//   var mapDiv = document.getElementById('map');
//   var map = new google.maps.Map(mapDiv, {
//     center: {lat: position.coords.latitude, lng: position.coords.longitude},
//     zoom: 10
//   });
//   for(var i=0; i<json.page.size; i++) {
//     addMarker(map, json._embedded.events[i]);
//   }
// }

function addMarker(map, event) {
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(event._embedded.venues[0].location.latitude, event._embedded.venues[0].location.longitude),
    map: map
  });
  marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
  console.log(marker);
}



getLocation();