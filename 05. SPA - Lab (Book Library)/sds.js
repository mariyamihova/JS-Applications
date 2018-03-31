function startApp() {

    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_rk-2oS4ze";
    const kinveyAppSecret = "736804a668784622997b9f61bcb3986d";


    // user/login
    function loginUser() {
        const kinveyLoginUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/login";
        const kinveyAuthHeaders = {
            'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
        };
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };

        $.ajax({
            method: "POST",
            url: kinveyLoginUrl,
            headers: kinveyAuthHeaders,
            data: userData,
            success: loginSuccess,
            error: handleAjaxError
        });

        function loginSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listAdverts();
            showInfo('Login successful.');
        }
    }

    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        $('#loggedInUser').text("Welcome, " + username + "!");
    }

    // user/register
    function registerUser() {
        const kinveyRegisterUrl = kinveyBaseUrl + "user/" + kinveyAppKey + "/";
        const kinveyAuthHeaders = {
            'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
        };

        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };

        $.ajax({
            method: "POST",
            url: kinveyRegisterUrl,
            headers: kinveyAuthHeaders,
            data: userData,
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

    // user/logout
    function logoutUser() {
        sessionStorage.clear();
        $('#loggedInUser').text("");
        showHideMenuLinks();
        showView('viewHome');
        showInfo('Logout successful.');
    }

    // advertisement/all
    function listAdverts() {
        $('#ads').empty();
        showView('viewAds');

        const kinveyAdvertsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adverts";
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
            if (adverts.length == 0) {
                $('#ads').text('No advertisements available.');
            } else {
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
                        .click(function() { displayAdvert($(this).attr("data-id")) });
                    let links = [readMoreLink];

                    if (advert._acl.creator == sessionStorage['userId']) {
                        let deleteLink = $(`<a data-id="${advert._id}" href="#">[Delete]</a>`)
                            .click(function() { deleteAdvert($(this).attr("data-id")) });
                        let editLink = $(`<a data-id="${advert._id}" href="#">[Edit]</a>`)
                            .click(function() { loadAdvertForEdit($(this).attr("data-id")) });
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

    // advertisement/create
    function createAdvert() {
        const kinveyAuthHeaders = {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };

        const kinveyUserUrl =
            `${kinveyBaseUrl}user/${kinveyAppKey}/${sessionStorage.getItem('userId')}`;

        $.ajax({
            method: "GET",
            url: kinveyUserUrl,
            headers: kinveyAuthHeaders,
            success: afterPublisherRequest,
            error: showError
        });

        function afterPublisherRequest(publisher) {
            let advertData = {
                title: $('#formCreateAd input[name=title]').val(),
                description: $('#formCreateAd textarea[name=description]').val(),
                publisher: publisher.username,
                datePublished: $('#formCreateAd input[name=datePublished]').val(),
                price: Number($('#formCreateAd input[name=price]').val()),
                image: $('#formCreateAd input[name=image]').val()
            };

            const kinveyAdvertsUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adverts";
            $.ajax({
                method: "POST",
                url: kinveyAdvertsUrl,
                headers: kinveyAuthHeaders,
                data: advertData,
                success: createAdvertSuccess,
                error: handleAjaxError
            });

            function createAdvertSuccess(response) {
                listAdverts();
                showInfo('Advertisement created.');
            }
        }
    }

    // advertisement/delete
    function deleteAdvert(advertId) {
        const kinveyBookUrl = kinveyBaseUrl + "appdata/" +
            kinveyAppKey + "/adverts/" + advertId;
        const kinveyAuthHeaders = {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };

        $.ajax({
            method: "DELETE",
            url: kinveyBookUrl,
            headers: kinveyAuthHeaders,
            success: deleteBookSuccess,
            error: handleAjaxError
        });

        function deleteBookSuccess(response) {
            listAdverts();
            showInfo('Advert deleted.');
        }
    }

    // advertisement/edit GET
    function loadAdvertForEdit(advertId) {
        const kinveyBookUrl = kinveyBaseUrl + "appdata/" +
            kinveyAppKey + "/adverts/" + advertId;
        const kinveyAuthHeaders = {
            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
        };

        $.ajax({
            method: "GET",
            url: kinveyBookUrl,
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

    function displayAdvert(advertId){
        const kinveyAdvertUrl = kinveyBaseUrl + "appdata/" +
            kinveyAppKey + "/adverts/" + advertId;
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
            let advertInfo = $('<div>').append(
                $(`<img src="${advert.image}">`),
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

    // advertisement/edit POST
    function editAdvert() {
        const kinveyAdvertUrl =  kinveyBaseUrl + "appdata/" + kinveyAppKey +
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
}