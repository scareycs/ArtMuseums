let geocoder;
const ratingSettings = {
  max_value: 5,
  step_size: 0.1,
  initial_value: 0,
  selected_symbol_type: 'utf8_star', // Must be a key from symbols
  cursor: 'default',
  readonly: true
}

function initMap() { //function that prepares map before zipcode and formats it for markers after zip code
  $("#map").hide(); 
  geocoder = new google.maps.Geocoder();
  let map = new google.maps.Map(document.getElementById('map'), { //gives geocode a generic position before user zipcode input
        zoom: 13,
        center: {lat: 40.731, lng: -73.997}
    });
  $(".zipCodeForm").submit("click", function(event){ //once zipcode is submitted...
    event.preventDefault();
    $(".intro").hide(); // initial welcome message will be hidden
    $(".appTitle").hide();
    $(".zipHeading").removeClass("zipHeading").addClass("appTitle2"); // title along with zipcode submission form will be reformatted
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

  function handleGeocodeSubmit(results, status){//after postal code submission to geocode..
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location); //map center will be rearranges
      let lat = results[0].geometry.location.lat(); //long and lat are set
      let lng = results[0].geometry.location.lng();
      let longlat = {lat: lat, lng: lng};
      let request = { 
        location: longlat , //based on the long and lat
        radius:10000, //within the radius of 10000 meters
        type: ['museum'],
        keyword: ['art']}; //the art museum search is done  
      let service = new google.maps.places.PlacesService(map); //google places request is called
      let mapTitle = results[0].formatted_address; //address is used for the title above the map
      $('.mapTitle').html(`Showing Art Museums in <span class="resultName">${mapTitle}</span>`); 
      service.nearbySearch(request, function(results, status){//art museum search request is called
        handleSearchResults(results, status);
      }); 
    } else {
      $("#map").hide();//if there is an error, the map will not show
      $('.listItems').html(``);//result items will be emptied
      $('.mapTitle').html(``);
      //if zipcode is not valid
      $('main').html(`<div class="error">Not a valid zipcode. Be sure to enter a valid zipcode.</div>`);//error message for non valid zipcodes
    }
  }

  /** Create infowindows, markers, and format the map */
  function handleSearchResults(results, status){

    // if results returned ok
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      const infoWindowsContent = []; //content array for info window is created
      let infoWindow = new google.maps.InfoWindow(); //info window for markers is created
      $("#map").show(); // the map will show

      // The title of the results list will show
      $('.resultsTitle').html(`You have <span class="resultNum">${results.length}</span> Results`); 
      $('.listItems').html(`<ul>`);
      results.forEach(place => {
        let name = `<div class="listName">${place.name}</div>`;
        let openingHours = (place.opening_hours && place.opening_hours.open_now !== undefined) ?
          `<div class="openNow">Open Now! </div>`: '';
        let ratings = (place.rating && place.rating !== undefined) ? 
          `<div class="rating" data-rate-value="${place.rating}"></div>`:'';
        let content = `${name} ${ratings} ${openingHours}`;
        
        infoWindowsContent.push(content);
      });

      createMarkers(results, map, infoWindow, infoWindowsContent);

      $('.listItems').append(`</ul>`);

    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS){//if no results in zip code area..
      $("#map").hide();
      $('main').html(`<div class="error">There are no art museums listed in this zip code.</div>`); //this error message will appear
      $('.listItems').html(``);
      $('.mapTitle').html(``);
    }
  }

  function createMarkers(results, map, infoWindow, infoWindowsContent){ //creates markers onto the map from search
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

  function displayList(listItem){ //displays all results from zip code search in a list
    const photoUrl = listItem.photos && listItem.photos.length > 0 && listItem.photos[0].getUrl({maxWidth: 1000});
    const imgNode = (photoUrl === undefined) ? '' : `<img src="${photoUrl}" alt="${listItem.name}">`;
    const hours = (listItem.opening_hours && listItem.opening_hours.open_now !== undefined) ?
                `<div class="openNow">Open Now! </div>`: '';
    const ratings = (listItem.rating && listItem.rating !== undefined) ? `<div class="list-rating" data-rate-value="${listItem.rating}"></div> `:'';
    $('.listItems').append(`
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