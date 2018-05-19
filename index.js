let geocoder;
const ratingSettings = {
  max_value: 5,
  step_size: 0.1,
  initial_value: 0,
  selected_symbol_type: 'utf8_star', // Must be a key from symbols
  cursor: 'default',
  readonly: true
}

/** Function that prepares map before zipcode and formats it for markers after zip code */
function initMap() { 
  $(".col-6").hide(); 
  geocoder = new google.maps.Geocoder();
  // Gives geocode a generic position before user zipcode input
  let map = new google.maps.Map(document.getElementById('map'), { 
        zoom: 13,
        center: {lat: 40.731, lng: -73.997}
    });
  $(".zipCodeForm").submit("click", function(event){ // Once zipcode is submitted...
    event.preventDefault();
    $(".intro").hide(); // Initial welcome message will be hidden
    $(".appTitle").hide();

    // Title along with zipcode submission form will be reformatted
    $(".zipHeading").removeClass("zipHeading").addClass("appTitle2"); 
    $(".zipCodeButton").removeClass("zipCodeButton").addClass("zipCodeButton2");
    $("#enterLabel").addClass("enterLabel2");
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


  /** Turns given zip code into lat lng, rearranges map center, and searches with 
  google keyword in museum type */
  function handleGeocodeSubmit(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location); // Map center will be rearranges
      let lat = results[0].geometry.location.lat(); // Long and lat are set
      let lng = results[0].geometry.location.lng();
      let longlat = {lat: lat, lng: lng};
      let request = { 
        location: longlat , // Based on the long and lat
        radius:10000, // Within the radius of 10000 meters
        type: ['museum'],
        keyword: ['art']}; // The art museum search is done  

      // Google places request is called
      let service = new google.maps.places.PlacesService(map); 
      
      // Address is used for the title above the map
      let mapTitle = results[0].formatted_address; 
      $('.mapTitle').html(`Showing Art Museums in <span class="resultName">${mapTitle}</span>`); 

      // Art museum search request is called
      service.nearbySearch(request, function(results, status) {
        handleSearchResults(results, status);
      }); 
    } else {
      $(".col-6").hide(); // If there is an error, the map will not show
      $('.listItems').html(``);// Result items will be emptied
      $('.resultsTitle').html(``); // If zipcode is not valid
      $('.mapTitle').html(`<div class="error">Not a valid zipcode. Be sure to enter a valid zipcode.</div>`);//error message for non valid zipcodes
    }
  }

  /** Create infowindows, markers, and format the map */
  function handleSearchResults(results, status) {

    // If results returned ok
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      const infoWindowsContent = []; // Content array for info window is created
      let infoWindow = new google.maps.InfoWindow(); // Info window for markers is created
      $(".col-6").show(); // The map will show

      // The title of the results list will show
      $('.resultsTitle').html(`You have <span class="resultNum">${results.length}</span> Results`); 
      $('.listItems').html(`<ul>`);

      // Content for the infoWindows is set and then pushed to the array infoWindowsContent
      results.forEach(place => {
        let name = `<div class="listName">${place.name}</div>`;
        let openingHours = ((place.opening_hours && place.opening_hours.open_now !== undefined) || (place.opening_hours && place.opening_hours.open_now !== false)) ?
          `<div class="openNow">Open Now! </div>`: '';
        let ratings = (place.rating && place.rating !== undefined) ? 
          `<div class="rating" data-rate-value="${place.rating}"></div>`:'';
        let content = `${name} ${ratings} ${openingHours}`;
        
        infoWindowsContent.push(content);
      });

      createMarkers(results, map, infoWindow, infoWindowsContent);

      //$('.listItems').append(`</ul>`);

    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS){// If no results in zip code area..
      $(".col-6").hide(); // Map will be hidden

      // This error message will appear
      $('.mapTitle').html(`<div class="error">There are no art museums listed in this zip code.</div>`); 
      $('.listItems').html(``);
      $('.resultsTitle').html(``); // If zipcode is not valid
    }
  }

  /** Creates markers onto the map from search */
  function createMarkers(results, map, infoWindow, infoWindowsContent){ 
      let bounds = new google.maps.LatLngBounds();
      for (let i = 0; i < results.length; i++) {
        let place = results[i];
        let marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          title: place.name
        });
        var myPlace = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
        bounds.extend(myPlace);
        google.maps.event.addListener(marker,'click', (function(marker){  // once you click a marker..
          return function() {
            infoWindow.setContent(infoWindowsContent[i]); //the content is set for the info window
            $(".rating").rate(ratingSettings);
            infoWindow.open(map,marker); // the infowindow is displayed for the marker that is clicked
          }
        })(marker));

        displayList(place);
      }
      map.fitBounds(bounds);
  }

  /** Displays all results from zip code search in a list */
  function displayList(listItem){
    const photoUrl = listItem.photos && listItem.photos.length > 0 
                   && listItem.photos[0].getUrl({maxWidth: 1000});
    const imgNode = (photoUrl === undefined) ? '' : `<img src="${photoUrl}" alt="${listItem.name}">`;
    const hours = (listItem.opening_hours && listItem.opening_hours.open_now !== undefined) ?
                  `<div class="openNow">Open Now! </div>`: '';
    const ratings = (listItem.rating && listItem.rating !== undefined) ? `<div class="list-rating" 
                  data-rate-value="${listItem.rating}"></div> `:'';
    $('.listItems ul').append(`
      <li>
        <div class="row">
          <div class="col-6">${imgNode}</div>
          <div class="col-6">
            <div class="listName">
              <p> ${listItem.name}</p>
            </div>
            <p>${listItem.vicinity}</p>
            <p>${hours}</p>
            <p>${ratings}</p>
          </div>
        </div>
      </li>`
    );
    $(".list-rating").rate(ratingSettings);

  }
}