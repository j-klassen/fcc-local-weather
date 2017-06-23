// Free Code Camp - Local Weather Application
//
// Targeting HTTPS.
// See https://erikflowers.github.io/weather-icons/ for weather icons

(function() {
	// Redirect to https.
	if (!window.location.protocol.includes('https')) {
		window.location.protocol = 'https:';
	}

	var apiKey = '4b77e236e4e215429aa57a7c408809c2';
	var forecastEndpoint = 'https://api.forecast.io/forecast/' + apiKey + '/';
	var locationEndpoint = 'https://ipapi.co/json';
	var locationCacheTime = 1000 * 60 * 5; // 5 minutes

	// Map api response icons to classes
	var iconMap = {
		'n/a': 'wi wi-na',
		'clear-day': 'wi wi-day-sunny',
		'clear-night': 'wi wi-night-clear',
		'rain': 'wi wi-rain-wind',
		'snow': 'wi wi-snow',
		'sleet': 'wi wi-sleet',
		'wind': 'wi wi-strong-wind',
		'fog': 'wi wi-fog',
		'cloudy': 'wi wi-cloudy',
		'partly-cloudy-day': 'wi wi-day-cloudy',
		'partly-cloudy-night': 'wi wi-night-cloudy',
		'hail': 'wi wi-hail',
		'thunderstorm': 'wi wi-thunderstorm',
		'tornado': 'wi wi-tornado'
	};

	/**
	 * Promise wrapper for jquery.get()
	 * @param {object} options - $.get() options
	 */
	function get(options) {
		return new Promise(function(resolve, reject) {
			$.getJSON(options)
			.done(function(res) {
				resolve(res);
			})
			.fail(function(err) {
				reject(err);
			});
		});
	}

	/**
	 * Handle lat/lng and ip location abstraction.
	 */
	function updateLocation(ip) {
		if ('geolocation' in navigator && !ip) {
			var options = {
				enableHighAccuracy: false,
				maximumAge: locationCacheTime
			};

			navigator.geolocation.getCurrentPosition(positionSuccess, positionError, options);
		} else {
			// IP based
			get({ url: locationEndpoint, dataType: 'json' })
			.then(function handleLocation(location) {
				// Conform to navigator.geolocation coords property.
				positionSuccess({
					coords: {
						latitude: location.lat,
						longitude: location.lon
				}});
			});
		}
	}

	// Fetch address from Google
	function positionSuccess(pos) {
		var geocoder = new google.maps.Geocoder();
		var location  = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

		geocoder.geocode({ 'latLng': location}, function (results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				document.querySelector('.location').textContent = results[2].formatted_address;

				updateForecast(pos);
			} else {
				reportError(new Error('There was an error fetching your address.'));
			}
		});
	}

	function positionError(err) {
		reportError(err);
		updateLocation(true);
	}

	function updateForecast(pos) {
		var forecastUrl = forecastEndpoint + pos.coords.latitude + ',' + pos.coords.longitude + ',' + (Date.now() / 1000 | 0);

		get({ url: forecastUrl, dataType: 'jsonp' })
		.then(function forecastSuccess(forecast) {
			// Store for repeated reference
			var degrees = document.querySelector('#degrees');
			var temperature = document.querySelector('#temperature');
			var apparentTemperature = document.querySelector('#apparent-temperature');

			// Add the degrees link click handler
			document.querySelector('#toggle-degrees').addEventListener('click', function toggleDegrees(evt) {
				evt.preventDefault();

				// Perform conversion
				if (degrees.className.includes('wi-celsius')) {
					degrees.className = 'wi wi-fahrenheit';
					temperature.innerHTML = forecast.currently.temperature | 0;
					apparentTemperature.innerHTML = 'Feels like ' + (forecast.currently.apparentTemperature | 0);
				} else {
					degrees.className = 'wi wi-celsius';
					temperature.innerHTML = celsius(forecast.currently.temperature) | 0;
					apparentTemperature.innerHTML = 'Feels like ' + (celsius(forecast.currently.apparentTemperature) | 0);
				}
			});

			// Setup the display elements data
			temperature.innerHTML = forecast.currently.temperature | 0;
			apparentTemperature.innerHTML = 'Feels like ' + (forecast.currently.apparentTemperature | 0);
			document.querySelector('.weather-summary').innerHTML = forecast.currently.summary;

			var icon = iconMap[forecast.currently.icon];

			if (!icon) {
				icon = iconMap['n/a'];
			}

			document.querySelector('.weather-container i').className = icon;
		})
		.catch(function forecastError(err) {
			reportError(err);
		});
	}

	/**
	 * Display error to user.
	 * @params {Error} err - Error object.
	 */
	function reportError(err) {
		document.querySelector('.location').textContent = err.message;
	}

	/**
	 * Convert fahrenheit temperatur to celsius.
	 * @param {number} temp - Temperature.
	 */
	function celsius(temp) {
		return (temp - 32) * 5/9;
	}

	// Main app logic
	function updateWeather() {
		updateLocation();
	}

	// Kick off app
	updateWeather();
})();
