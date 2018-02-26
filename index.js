function initMap() {

  var longlat = {lat: -25.363, lng: 131.044};
  var longlat2 ={lat: -25.23, lng: 130.044};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: longlat
  });

  var marker = new google.maps.Marker({
    position: longlat,
    map: map
  });

  var marker2 = new google.maps.Marker({
    position: longlat2,
    map:map
  })
 }