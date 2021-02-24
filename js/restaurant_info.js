let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiY29rZWxpZ2h0IiwiYSI6ImNqcHhjOXhjNzA5Z2M0OWw5OGZuczVza2IifQ.AZHUzh2j-KOPKi0YPahxbg',
        maxZoom: 18,
        attribution: 'Map data &copy; <a style="color: #2e7490" href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a style="color: #2e7490" href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a style="color: #2e7490" href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  


/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML(restaurant, (parseInt(id)-1));
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant, id) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name + " Restaurant";
  name.setAttribute("tabindex", "-1");
  
  const address = document.getElementById('restaurant-address');
  address.innerHTML = "Restaurant Address: " + restaurant.address;
  address.setAttribute("tabindex", "0");
  
  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute("alt", DBHelper.imageAltText(id));
  image.setAttribute("tabindex", "0");

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type + " Cuisine";
  cuisine.setAttribute("tabindex", "0");

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  hours.setAttribute("tabindex", "0");
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    const day = document.createElement('td');
    let operatingKey = operatingHours[key];
    operatingKey = operatingKey.replace("-", "to");
    operatingKey = operatingKey.replace("-", "to");
    day.innerHTML = key + ' ' + operatingKey;
    row.appendChild(day);
    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {

  const container = document.getElementById('section-reviews-container');
  const title = document.createElement('h2');
  title.className = 'review-header';
  title.innerHTML = 'Reviews';
  title.setAttribute("tabindex", "0");
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.setAttribute("tabindex", "0");
    container.appendChild(noReviews);
    return;
  }
  reviews.forEach(review => {
    createReviewHTML(container, review);
  });
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (container, review) => {

  const containerBlock = document.createElement('div');
  containerBlock.className = "section-reviews-container-block";
  const leftContainer = document.createElement('div');
  leftContainer.className = "left-container-block";
  leftContainer.innerHTML = "<h4>" + review.name + "</h4>";  
  leftContainer.setAttribute("tabindex", "0");

  containerBlock.appendChild(leftContainer);
  const rightContainer = document.createElement('div');
  rightContainer.className = "right-container-block";
  rightContainer.innerHTML = "<h4>" + review.date + "</h4>";
  rightContainer.setAttribute("tabindex", "0");
  containerBlock.appendChild(rightContainer);

  container.appendChild(containerBlock);
  const contentContainerBlock = document.createElement('div');
  contentContainerBlock.className = "content-container-block";

  const reviewRating = document.createElement('div');
  reviewRating.className = "review-ratings";
  const linkReviewRating = document.createElement('a');
  linkReviewRating.href = "#";
  linkReviewRating.textContent = "RATING: " + review.rating;
  reviewRating.appendChild(linkReviewRating);
  contentContainerBlock.appendChild(reviewRating);

  const reviewContent = document.createElement('div');
  reviewContent.className = "review-content";  
  reviewContent.textContent = review.comments;
  reviewContent.setAttribute("tabindex", "0");
  contentContainerBlock.appendChild(reviewContent);
  container.appendChild(contentContainerBlock);

  const endContainerBlock = document.createElement('div');
  endContainerBlock.className = "end-container-block";
  container.appendChild(endContainerBlock);
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const breadcrumbList = document.getElementById('breadcrumb-list');
  const li = document.createElement('li');
  const aTag = document.createElement('a');
  aTag.href = "#";
  aTag.innerHTML = restaurant.name;
  aTag.setAttribute('aria-current','page');
  li.appendChild(aTag);  
  breadcrumbList.appendChild(li);
  breadcrumb.appendChild(breadcrumbList);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
