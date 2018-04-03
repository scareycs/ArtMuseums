let geocoder;
function initMap() {
  $("#map").hide();
  geocoder = new google.maps.Geocoder();
  let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 40.731, lng: -73.997}
    });
  $(".zipCodeForm").submit("click", function(event){
    event.preventDefault();
    $(".intro").hide();
    $(".appTitle").hide();
    $(".zipHeading").removeClass("zipHeading").addClass("appTitle2");
    $("#zipLabel").addClass("zipLabel").html("Art Escape");
    $("#enterLabel").html("Zip Code");
    let zipCode = $("#zipCode").val();
    geocoder.geocode({
      componentRestrictions: {
        country: 'US',
        postalCode: zipCode
      }
    }, function(results, status) {
      handleGeocodeSubmit(results, status);
      });
  });

  function handleGeocodeSubmit(results, status){
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
      let mapTitle = results[0].formatted_address;
      $('.mapTitle').html(`Showing Art Museums in <span class="resultName">${mapTitle}</span>`);
      service.nearbySearch(request, function(results, status){
        handleSearchResults(results, status);
      }); 
    } else {
      $("#map").hide();
      $('.listItems').html(``);
      $('.mapTitle').html(``);
      //if zipcode is not valid
      $('main').html(`<div class="error">Not a valid zipcode. Be sure to enter a valid zipcode.</div>`);
    }
  }

  function handleSearchResults(results, status){
      if (status == google.maps.places.PlacesServiceStatus.OK) {// if results returned ok
        const infoWindowsContent = [];
        let infoWindow = new google.maps.InfoWindow();
        $("#map").show();
        $('.resultsTitle').html(`You have <span class="resultNum">${results.length}</span> Results`);
        $('.listItems').html(`<ul>`);
        results.forEach(place => {
          let name = `<div class="listName">${place.name}</div>`;
          let openingHours = (place.opening_hours && place.opening_hours.open_now !== undefined) ?
            `<div class="openNow">Open Now! </div>`: '';
          let ratings = (place.rating && place.rating !== undefined) ? `Rating: ${place.rating}`:'';
          let content = `${name} ${ratings} ${openingHours}`;
          infoWindowsContent.push(content);
        });
        
        createMarkers(results, map, infoWindow, infoWindowsContent);

        $('.listItems').append(`</ul>`);

      } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS){//if no results in zip code area..
        $("#map").hide();
        $('main').html(`<div class="error">There are no art museums listed in this zip code.</div>`);
        $('.listItems').html(``);
        $('.mapTitle').html(``);
      }
  }

  function createMarkers(results, map, infoWindow, infoWindowsContent){
      for (let i = 0; i < results.length; i++) {
        let place = results[i];
        let marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          title: place.name
        });

        google.maps.event.addListener(marker,'click', (function(marker){ 
          return function() {
            infoWindow.setContent(infoWindowsContent[i]);
            infoWindow.open(map,marker);
          }
        })(marker));

        displayList(place);
      }
  }

  function displayList(listItem)
  {   
    const photoUrl = listItem.photos && listItem.photos.length > 0 && listItem.photos[0].getUrl({maxWidth: 1000});
    const imgNode = (photoUrl === undefined) ? '' : `<img src="${photoUrl}" alt="${listItem.name}">`;
    const Hours = (listItem.opening_hours && listItem.opening_hours.open_now !== undefined) ?
                `<div class="openNow">Open Now! </div>`: '';
    const Ratings = (listItem.rating && listItem.rating !== undefined) ? `Rating: ${listItem.rating}`:'';
    $('.listItems').append(`
      <li>
        <div class="row">
          <div class="col-6">${imgNode}</div>
          <div class="col-6">
            <div class="listName">
              <p> ${listItem.name}</p>
            </div>
            <p>${listItem.vicinity}</p>
            <p>${Hours}</p>
            <p>Rating: ${listItem.rating}</p>
          </div>
        </div>
      </li>`
    );
  }
}