// Free Code Camp - Local Weather Application

// Notes:
// navigator.geolocation.getCurrentPosition() is problemnatic without https,
// so we'll use http://ip-api.com/json to keep things simple.
//
// See https://erikflowers.github.io/weather-icons/ for weather icons
//
// Todo:
// 1) Add tooltip info about location fetch by IP, could be wrong when
// being proxied, out of user control, etc.

(function() {
	var apiKey = '4b77e236e4e215429aa57a7c408809c2';
	var forecastEndpoint = 'https://api.forecast.io/forecast/' + apiKey + '/';
	var locationEndpoint = 'http://ip-api.com/json';

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

	// Promise wrapper for $.get()
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

	// Main app logic
	function updateWeather() {
		get({ url: locationEndpoint, dataType: 'jsonp' })
		.then(function handleLocation(location) {
			var output = location.city + ' ' + location.region + ', ' + location.country;
			document.querySelector('.location').textContent = output;

			var forecastUrl = forecastEndpoint + location.lat + ',' + location.lon + ',' + (Date.now() / 1000 | 0);
			return get({ url: forecastUrl, dataType: 'jsonp' });
		})
		.then(function handleWeather(forecast) {
			console.log(forecast.currently);

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
		.catch(function updateWeatherError(err) {
			console.error(err);
		});
	}

	/**
	 * Convert fahrenheit temperatur to celsius.
	 * @param {number} temp - Temperature.
	 */
	function celsius(temp) {
		return (temp - 32) * 5/9;
	}

	// Kick off app
	updateWeather();
})();
