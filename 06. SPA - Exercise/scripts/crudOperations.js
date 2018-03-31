const BASE_URL = 'https://baas.kinvey.com/';
const APP_KEY = 'kid_ryIsKzc9G';
const APP_SECRET = '478bb89aaa95437087595f8563c47e3d';
const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)};

function registerUser() {
    let username = $('#formRegister').find('input[name=username]').val();
    let password = $('#formRegister').find('input[name=passwd]').val();

    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/',
        headers: AUTH_HEADERS,
        data: {username, password},
        success: registerSuccess,
        error: handleAjaxError
    });
    function registerSuccess(userInfo) {
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        listAdverts();
        showInfo('User registration successful.');
    }
}
function saveAuthInSession(userInfo) {
    let userAuth = userInfo._kmd.authtoken;
    sessionStorage.setItem('authToken', userAuth);
    let userId = userInfo._id;
    sessionStorage.setItem('userId', userId);
    let username = userInfo.username;
    sessionStorage.setItem('username', username);
    $('#loggedInUser').text("Welcome, " + username + "!");
}
function loginUser() {
    let username = $('#formLogin').find('input[name=username]').val();
    let password = $('#formLogin').find('input[name=passwd]').val();
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        headers: AUTH_HEADERS,
        data: {username, password},
        success: loginSuccess,
        error: handleAjaxError
    })
    function loginSuccess(userInfo) {
        saveAuthInSession(userInfo);
        showHomeView();
        showHideMenuLinks();
        listAdverts();
        showInfo('Login successful.');
    }

}
function logoutUser() {
    sessionStorage.clear();
    $('#loggedInUser').text("");
    showHideMenuLinks();
    showView('viewHome');
    showInfo('Logout successful.');
}
function listAdverts() {
    $('#ads').empty();
    showView('viewAds');

    const kinveyAdvertsUrl = BASE_URL + "appdata/" + APP_KEY + "/adverts";
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };
    $.ajax({
        method: "GET",
        url: kinveyAdvertsUrl,
        headers: kinveyAuthHeaders,
        success: loadAdvertsSuccess,
        error: handleAjaxError
    });
    function loadAdvertsSuccess(adverts) {
        showInfo('Advertisements loaded.');
        if (adverts.length === 0) {
            $('#ads').text('No advertisements available.');
        } else {
            $('#ads').empty();
            let advertsTable = $('<table>')
                .append($('<tr>').append(
                    '<th>Title</th>',
                    '<th>Description</th>',
                    '<th>Publisher</th>',
                    '<th>Date Published</th>',
                    '<th>Price</th>',
                    '<th>Actions</th>')
                );

            for (let advert of adverts) {
                let readMoreLink = $(`<a data-id="${advert._id}" href="#">[Read More]</a>`)
                    .click(function () {
                        displayAdvert($(this).attr("data-id"))
                    });
                let links = [readMoreLink];

                if (advert._acl.creator === sessionStorage['userId']) {
                    let deleteLink = $(`<a data-id="${advert._id}" href="#">[Delete]</a>`)
                        .click(function () {
                            deleteAdvert($(this).attr("data-id"))
                        });
                    let editLink = $(`<a data-id="${advert._id}" href="#">[Edit]</a>`)
                        .click(function () {
                            loadAdvertForEdit($(this).attr("data-id"))
                        });
                    links = [readMoreLink, ' ', deleteLink, ' ', editLink];
                }

                advertsTable.append($('<tr>').append(
                    $('<td>').text(advert.title),
                    $('<td>').text(advert.description),
                    $('<td>').text(advert.publisher),
                    $('<td>').text(advert.datePublished),
                    $('<td>').text(advert.price),
                    $('<td>').append(links)
                ));
            }

            $('#ads').append(advertsTable);
        }

    }

}
function createAdvert(event) {
    event.preventDefault();
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };
    let advertData = {
        title: $('#formCreateAd input[name=title]').val(),
        description: $('#formCreateAd textarea[name=description]').val(),
        publisher: sessionStorage.getItem('username'),
        datePublished: $('#formCreateAd input[name=datePublished]').val(),
        price: Number($('#formCreateAd input[name=price]').val()),
        image: $('#formCreateAd input[name=image]').val()
    };

    const kinveyAdvertsUrl = BASE_URL + "appdata/" + APP_KEY + "/adverts";
    $.ajax({
        method: "POST",
        url: kinveyAdvertsUrl,
        headers: kinveyAuthHeaders,
        data: advertData,
    }).then(function () {
        listAdverts();
        showInfo('Advertisement created.');
    }).catch(handleAjaxError);

    // function createAdvertSuccess(response) {
    //     listAdverts();
    //     showInfo('Advertisement created.');
    // }


}
function deleteAdvert(advertId) {
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };
    $.ajax({
        method: "DELETE",
        url: BASE_URL + "appdata/" + APP_KEY + "/adverts/" + advertId,
        headers: kinveyAuthHeaders,
        success: deleteAdvertSuccess,
        error: handleAjaxError
    });
    function deleteAdvertSuccess(response) {
        listAdverts();
        showInfo('Advert deleted.');
    }
}
function loadAdvertForEdit(advertId) {
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };
    $.ajax({
        method: "GET",
        url: BASE_URL + "appdata/" + APP_KEY + "/adverts/" + advertId,
        headers: kinveyAuthHeaders,
        success: loadAdvertForEditSuccess,
        error: handleAjaxError
    });
    function loadAdvertForEditSuccess(advert) {
        $('#formEditAd input[name=id]').val(advert._id);
        $('#formEditAd input[name=title]').val(advert.title);
        $('#formEditAd input[name=publisher]').val(advert.publisher);
        $('#formEditAd textarea[name=description]').val(advert.description);
        $('#formEditAd input[name=datePublished]').val(advert.datePublished);
        $('#formEditAd input[name=price]').val(advert.price);
        $('#formEditAd input[name=image]').val(advert.image);
        showView('viewEditAd');
    }
}
function displayAdvert(advertId) {
    const kinveyAdvertUrl = BASE_URL + "appdata/" +
        APP_KEY + "/adverts/" + advertId;
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };

    $.ajax({
        method: "GET",
        url: kinveyAdvertUrl,
        headers: kinveyAuthHeaders,
        success: displayAdvertSuccess,
        error: handleAjaxError
    });
    $('#viewDetailsAd').empty();
    function displayAdvertSuccess(advert) {
        //console.log(advert.image)
        let advertInfo = $('<div>').append(
            $('<img>').attr("src", advert.image),
            $('<br>'),
            $('<label>').text('Title:'),
            $('<h1>').text(advert.title),
            $('<label>').text('Description:'),
            $('<p>').text(advert.description),
            $('<label>').text('Publisher:'),
            $('<div>').text(advert.publisher),
            $('<label>').text('Date:'),
            $('<div>').text(advert.datePublished));

        $('#viewDetailsAd').append(advertInfo);

        showView('viewDetailsAd');
    }
}
function editAdvert() {
    const kinveyAdvertUrl = BASE_URL + "appdata/" + APP_KEY +
        "/adverts/" + $('#formEditAd input[name=id]').val();
    const kinveyAuthHeaders = {
        'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
    };
    let advertData = {
        title: $('#formEditAd input[name=title]').val(),
        description: $('#formEditAd textarea[name=description]').val(),
        publisher: $('#formEditAd input[name=publisher]').val(),
        datePublished: $('#formEditAd input[name=datePublished]').val(),
        price: $('#formEditAd input[name=price]').val(),
        image: $('#formEditAd input[name=image]').val()
    };
    $.ajax({
        method: "PUT",
        url: kinveyAdvertUrl,
        headers: kinveyAuthHeaders,
        data: advertData,
        success: editAdvertSuccess,
        error: handleAjaxError
    });
    function editAdvertSuccess(response) {
        listAdverts();
        showInfo('Advertisement edited.');
    }
}
function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error.";
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description;
    showError(errorMsg);
}
