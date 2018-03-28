function attachEvents() {
    const baseUrl = 'https://judgetests.firebaseio.com';
    $('#submit').click(loadForecast);

    function request(endPoint) {
        return $.ajax({
            method: 'GET',
            url: baseUrl + endPoint
        })

    }

    function loadForecast() {
        request('/locations.json')
            .then(displayLocations)
            .catch(handleError)

    }

    function displayLocations(data) {
        let inputLocation = $('#location').val();
        let code = data
            .filter(loc => loc['name'] === inputLocation)
            .map(loc => loc['code'])[0];
        if (!code) {
            handleError();
        }

        let forecastToday = request(`/forecast/today/${code}.json`);
        let upcomingForecast = request(`/forecast/upcoming/${code}.json`);
        Promise.all([forecastToday, upcomingForecast])
            .then(displayAllForecastInfo)
            .catch(handleError);

    }

    function displayAllForecastInfo([weatherToday, upcomingWeather]) {
        let weatherSymbols = {
            'Sunny': '&#x2600;',
            'Partly sunny': '&#x26C5;',
            'Overcast': '&#x2601;',
            'Rain': '&#x2614;'
        };

        let forecast = $('#forecast');
        forecast.css('display', 'block');
        displayToCurrent(weatherToday, weatherSymbols);
        displayToUpcoming(upcomingWeather, weatherSymbols);
    }

    function displayToCurrent(weatherToday, weatherSymbols) {
        let current = $('#current')
        current.empty();
        current.append($('<div class="label">Current conditions</div>'))
            .append($(`<span class="condition symbol">${weatherSymbols[weatherToday['forecast']['condition']]}</span>`))
            .append($('<span class="condition"></span>')
                .append($(`<span class="forecast-data">${weatherToday['name']}</span>`))
                .append($(`<span class="forecast-data">${weatherToday['forecast']['low']}&#176;/${weatherToday['forecast']['high']}&#176;</span>`))
                .append($(`<span class="forecast-data">${weatherToday['forecast']['condition']}</span>`)))
    }

    function displayToUpcoming(upcomingWeather, weatherSymbols) {
        let upcoming = $('#upcoming');
        upcoming.empty()
        upcoming.append($('<div class="label">Three day forecast</div>'))
        let data = upcomingWeather['forecast'];
        for (let info of data) {
            upcoming
                .append($('<span class="upcoming"></span>')
                    .append($(`<span class="symbol">${weatherSymbols[info['condition']]}</span>`))
                    .append($(`<span class="forecast-data">${info['low']}&#176;/${info['high']}&#176;</span>`))
                    .append($(`<span class="forecast-data">${info['condition']}</span>`)))
        }

    }

    function handleError() {
       $('#forecast').css('display','block').text('Error');

    }

}
