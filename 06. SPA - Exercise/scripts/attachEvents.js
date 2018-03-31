function attachAllEvents() {
    // Bind the navigation menu links
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListAds").click(listAdverts);
    $("#linkCreateAd").click(showCreateAdView);
    $("#linkLogout").click(logoutUser);

    // Bind the form submit buttons
    // $("#buttonLoginUser").click(loginUser);
    // $("#buttonRegisterUser").click(registerUser);
    // $("#buttonCreateAd").click(createAdvert);
    // $("#buttonEditAd").click(editAdvert);
    //
    $("#buttonLoginUser").on('click', loginUser)
    $("#buttonRegisterUser").on('click', registerUser)
    $("#buttonCreateAd").on('click', createAdvert)
    $("#buttonEditAd").on('click', editAdvert)
    $("form").on('click', function(event) { event.preventDefault() })

    // Bind the info / error boxes
    $("#infoBox, #errorBox").click(function() {
        $(this).fadeOut();
    });

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });

}
