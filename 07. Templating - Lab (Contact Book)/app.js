$(() => {
    let data;
    let details;

    async function loadFiles() {
        let contacts = await $.get('templates/contacts.html');
        details = await $.get('templates/details.html');
        data = await $.get('data.json');

        let obj = {
            contacts: data
        }
        let contactsTemplate = Handlebars.compile(contacts);
        let table = contactsTemplate(obj);
        $('#list').append(table);
        attachEvents();
    }

    loadFiles();

    function attachEvents() {
        $('.contact').on('click', function () {
            loadDetails($(this).attr('data-id'));
            $('.active').removeClass('active');
            $(this).addClass('active');
        })
    }

    function loadDetails(index) {
        let detailsTemplate = Handlebars.compile(details);
        let html = detailsTemplate(data[index])
        $('#details').empty();
        $('#details').append(html);
    }

});