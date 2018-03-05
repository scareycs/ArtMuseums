let geocoder;

function initMap() {

  geocoder = new google.maps.Geocoder();
  let longlat = {lat: -25.363, lng: 131.044};

  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: longlat
  });

  let marker = new google.maps.Marker({
    position: longlat,
    map: map
  });

  let request = {
    location: longlat ,
    radius:4047,
    types: ['Malls']};

  let service = new google.maps.places.PlacesService(map);

  service.nearbySearch(request, callback);

  function callback(results, status){
     if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          var place = results[i];
          console.log(results[i]);
        }
      }   
  }


  $(".zipcodeForm").submit("click", function(event){
    event.preventDefault();
    let zipcode = $("#ZipCode").val();
    //console.log(zipcode);
    geocoder.geocode({
      componentRestrictions: {
        country: 'US',
        postalCode: zipcode
      }
    }, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        });
      } else {
        window.alert('Geocode was not successful for the following reason: ' + status);
      }
 
    });

  });
}
