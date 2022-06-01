//global variables
//var for the location search field input
var searchField = document.querySelector("#location");
//var to store the google maps api link
var googleMapsGeocodeApiLink = "https://maps.googleapis.com/maps/api/geocode/json?address=";
var googleMapsGeocodeApiKey = "&key=AIzaSyBjwEk24WO-R9Ad8hxTNUM4BvsIzH8fQDw"

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
    var completeUrlString = googleMapsGeocodeApiLink + locationUrlString + googleMapsGeocodeApiKey
    console.log(completeUrlString);
    apiFetch(completeUrlString)
  })
}
// step 2 - pass the coordinates into the ticketmaster API (showevents, addMarker, showPosition?, )
function apiFetch (completeUrlString) {
  fetch(completeUrlString)
    .then(function(res) {
      return res.json()
    })
    .then(function(data) {
      console.log(data)
      var gLatitude = data.results[0].geometry.location.lat;
      var gLongitude = data.results[0].geometry.location.lng;
      console.log(gLatitude);
      console.log(gLongitude);
    })
}


function showPosition(position) {
    var x = document.getElementById("location");
    x.innerHTML = "Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude; 
    var latlon = position.coords.latitude + "," + position.coords.longitude;


    $.ajax({
      type:"GET",
      url:"https://app.ticketmaster.com/discovery/v2/events.json?apikey=dF6HrGys01GsTDqeXhdq6gQ4GvGoHrdF&latlong="+latlon,
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


function initMap(position, json) {
  var mapDiv = document.getElementById('map');
  var map = new google.maps.Map(mapDiv, {
    center: {lat: position.coords.latitude, lng: position.coords.longitude},
    zoom: 10
  });
  for(var i=0; i<json.page.size; i++) {
    addMarker(map, json._embedded.events[i]);
  }
}

function addMarker(map, event) {
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(event._embedded.venues[0].location.latitude, event._embedded.venues[0].location.longitude),
    map: map
  });
  marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
  console.log(marker);
}




getLocation();