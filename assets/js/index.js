//global variables
//var for the location search field input
var searchField = document.querySelector("#location");
//var to store the google maps api link
var googleMapsGeocodeApiLink = "https://maps.googleapis.com/maps/api/geocode/json?address=";
var googleMapsGeocodeApiKey = "&key=AIzaSyBjwEk24WO-R9Ad8hxTNUM4BvsIzH8fQDw";
var ticketMasterApiLink = "https://app.ticketmaster.com/discovery/v2/events.json?sort=distance,date,asc&startDateTime=2022-06-01T00:00:00Z&apikey=dF6HrGys01GsTDqeXhdq6gQ4GvGoHrdF&latlong=";
// og ticketmaster URL https://app.ticketmaster.com/discovery/v2/events.json?apikey=dF6HrGys01GsTDqeXhdq6gQ4GvGoHrdF&latlong=

var map = document.getElementById("map");

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
};


// function that displays google map 
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
};

//function to place makrers on the map
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
    title: data._embedded.events[i].name
  })
  }
};

getLocation();