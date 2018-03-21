let geocoder;

function initMap() {
  $("#map").hide();
  geocoder = new google.maps.Geocoder();
  let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 40.731, lng: -73.997}
    });

  $(".zipcodeForm").submit("click", function(event){
    event.preventDefault();
    let zipcode = $("#ZipCode").val();
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
        let mapTitle = results[0].formatted_address;
        function callback(results, status){
          let place;
          let marker;
           if (status == google.maps.places.PlacesServiceStatus.OK) {// if results returned ok
            $("#map").show();
            $('.mapTitle').html(`Showing Art Museums in ${mapTitle}`);
                $('.resultsTitle').html(`You have ${results.length} Results`);
                $('.listItems').html(`<ul>`);
                  for (let i = 0; i < results.length; i++) {
                    place = results[i];
                    marker = new google.maps.Marker({
                      map: map,
                      position: place.geometry.location,
                      title: place.name
                    });
                    displayList(place);
                  }
                $('.listItems').append(`</ul>`);
            }
           else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS){//if no results in zip code area..
                $("#map").hide();
                $('.resultsTitle').html(`There are no art museums listed in this zip code.`);
                $('.listItems').html(``);
                $('.mapTitle').html(``);
            }
        }   
      }
      else {
        $("#map").hide();
        $('.listItems').html(``);
        $('.mapTitle').html(``);
        $('.resultsTitle').html(`Not a valid zipcode. Be sure to enter a valid zipcode`);//if zipcode is not valid
      }
    });
  });

  function displayList(listItem)
  {
      $('.listItems').append(`<li>Name: ${listItem.name} - Address: ${listItem.vicinity}</li>`);
  }
}
