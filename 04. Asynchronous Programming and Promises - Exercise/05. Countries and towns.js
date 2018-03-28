function attachEvents() {
    const basUrl = 'https://baas.kinvey.com/appdata/kid_S1THSu85G';
    const kinveyUsername = 'guest';
    const kinveyPassword = 'guest';
    const base64auth = btoa(kinveyUsername + ':' + kinveyPassword);
    const authHeaders = {
        'Authorization': 'Basic ' + base64auth,
        'Content-Type': 'application/json'
    };


    $('#btnLoadCountries').click(loadAllCountries);
    $('.create').click(createCountry);
    $('#btnLoadTowns').click(displayAllTowns);
    $('#loadCountry').click(createSelectMenu);
    $('#createTown').click(createTown);
    function createSelectMenu() {
        //console.log('here')
        request('GET', '/countries')
            .then(generateOptionMenu)
            .catch(handleError);

    }

    function generateOptionMenu(allCountries) {

        let select = $('#countryList');

        for (let country of allCountries) {
            select.append(`<option data-id="${country['_id']}">${country['name']}</option>`)
        }



    }

    function request(method, endpoint, data) {
        return $.ajax({
            method: method,
            url: basUrl + endpoint,
            headers: authHeaders,
            data: JSON.stringify(data)
        });
    }

    function loadAllTowns(towns) {
        let table = $('#towns');
        table.empty();

        for (let town of towns) {

            table.append($(`<div class="town" data-id="${town['_id']}">`)
                .append($(`<input type="text" class="name" value="${town['town']}">`))
                .append($(`<input type="hidden" class="countryId" value="${town['countryId']}">`))
                .append($('<button>[Edit]</button>').click(editTown))
                .append($('<button>[Delete]</button>').click(deleteTown)))


        }
    }

    function loadAllCountries() {
        request('GET', '/countries')
            .then(displayAllCountries)
            .catch(handleError);
    }

    function displayAllTowns() {
        let targetCountry = $('#targetCountry').val();
        request('GET', `/countries?query={"name":"${targetCountry}"}`)
            .then(displayTownsByCountry)
            .catch(handleError);

    }

    function displayTownsByCountry(countryObj) {
        console.log(countryObj);
        let countryId = countryObj[0]['_id'];
        console.log(countryId);
        request('GET', `/towns?query={"countryId":"${countryId}"}`)
            .then(loadAllTowns)
            .catch(handleError);


    }

    function editTown() {
        let town = $(this).parent();
        let countryId = $(this).parent().find('.countryId').val();

        let townObj = {
            town: town.find('.name').val(),
            countryId: countryId
        }

        request('PUT', `/towns/${town.attr('data-id')}`, townObj)
            .then(displayAllTowns)
            .catch(handleError);
    }

    function deleteTown() {
        let townId = $(this).parent().attr('data-id');

        request('DELETE', `/towns/${townId}`)
            .then(displayAllTowns)
            .catch(handleError);
    }

    function displayAllCountries(countries) {

        let table = $('#countries');
        table.empty();

        for (let country of countries) {
            table.append($(`<div class="country" data-id="${country['_id']}">`)
                .append($(`<input type="text" class="name" value="${country['name']}">`))
                .append($('<button>[Edit]</button>').click(editCountry))
                .append($('<button>[Delete]</button>').click(deleteCountry)))

            countriesCollection[country['name']] = country['_id'];
        }


    }

    function editCountry() {
        let country = $(this).parent();

        let countryObj = {
            name: country.find('.name').val()
        }

        request('PUT', `/countries/${country.attr('data-id')}`, countryObj)
            .then(loadAllCountries)
            .catch(handleError);

    }

    function deleteCountry() {
        let countryId = $(this).parent().attr('data-id');
        console.log(countryId);
        request('DELETE', `/countries/${countryId}`)
            .then(loadAllCountries)
            .catch(handleError);
    }

    function createTown() {
        
        let name = $('#townName').val();
        let countryId=$('#countryList').find('option:selected').attr('data-id');

        let townObj = {
            town: name,
            countryId:countryId
        };
        $('#townName').val('');

        request('POST', '/towns', townObj)
            .then()
            .catch(handleError);
        // console.log(name)
        // console.log(countryId);

    }

    function createCountry(event) {
        event.preventDefault();
        let name = $('#name');

        let countryObj = {
            name: name.val()
        };
        name.val('');
        request('POST', '/countries', countryObj)
            .then(loadAllCountries)
            .catch(handleError);

    }

    function loadTownsByCountry() {

        let targetCountry = $('#targetCountry').val();
        let targetId = countriesCollection[targetCountry];
        console.log(targetCountry)
        console.log(targetId)

    }

    function handleError(err) {
        alert(`ERROR: ${err.statusText}`);
    }
}
