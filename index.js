let geocoder;

function initMap() {

  geocoder = new google.maps.Geocoder();
  let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat: 40.731, lng: -73.997}
    });


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
        let lat = results[0].geometry.location.lat(); 
        let lng = results[0].geometry.location.lng();
        let longlat = {lat: lat, lng: lng};
        let request = {
          location: longlat ,
          radius:4000,
          type: ['museum'],
          keyword: ['art']};
        let service = new google.maps.places.PlacesService(map);

        service.nearbySearch(request, callback);

        function callback(results, status){
           if (status == google.maps.places.PlacesServiceStatus.OK) {
              for (var i = 0; i < results.length; i++) {
                var place = results[i];
                var marker = new google.maps.Marker({
                  map: map,
                  position: results[0].geometry.location
                });
                console.log(results[i]);
              }
            }   
        }
        

      } else {
        window.alert('Geocode was not successful for the following reason: ' + status);
      }
 
    });

  });
}
