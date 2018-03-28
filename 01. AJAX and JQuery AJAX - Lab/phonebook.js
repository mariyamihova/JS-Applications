$(function () {
    $('#btnLoad').click(loadContacts);
    $('#btnCreate').click(createContact);

    let baseServiceUrl =
        'https://testapp-85723.firebaseio.com/phonebook';

    function loadContacts() {
        $("#phonebook").empty();
        $.get(baseServiceUrl + '.json')
            .then(displayContacts)
            .catch(displayError);

    }

    function displayContacts(contacts) {
        for (let key in contacts) {
            let person = contacts[key]['person']
            let phone = contacts[key]['phone'];
            let li = $("<li>");
            li.text(person + ': ' + phone + ' ');
            $("#phonebook").append(li);
            li.append($("<button>Delete</button>").click(deleteContact.bind(this, key)));
            li.append($("<button>Edit</button>").click(editContact.bind(this, key)));
        }


    }

    function displayError(err) {

        $("#phonebook").append($("<li>Error</li>"));
    }

    function createContact() {

        let contactJSON = JSON.stringify({
            person: $('#person').val(),
            phone: $('#phone').val()
        })
        $.post(baseServiceUrl + '.json', contactJSON)
            .then(loadContacts)
            .catch(displayError);

        $('#person').val('');
        $('#phone').val('');
    }

    function deleteContact(key) {
        // $.ajax({
        //     method: 'DELETE',
        //     url: baseServiceUrl+"/"+key+".json"
        // }).then(displayContacts)
        //     .catch(displayError);
        let request = {
            method: 'DELETE',
            url: baseServiceUrl + '/' + key + '.json'
        };
        $.ajax(request)
            .then(loadContacts)
            .catch(displayError);


    }

    function editContact(key) {

        $.get(baseServiceUrl + '/' + key + '.json')
            .then(function loadSingleContact(contact) {
                //console.log(contact);
                let person = contact['person']
                let phone = contact['phone']
                $("#phonebook").append(`Name: <input type="text" id="newPerson" value="${person}"/><br>`)
                    .append(`Phone: <input type="text" id="newPhone" value="${phone}"/><br>`)
                    .append($(`<button id="btnSave">Save changes</button>`).click(processEdit))
                    .append($(`<button id="btnCancel">Cancel</button>`).click(loadContacts))
                function processEdit() {
                    let newNameValue = $('#newPerson').val();
                    let newPhoneValue = $('#newPhone').val();
                    console.log(newNameValue)
                    console.log(newPhoneValue)
                    console.log(key);
                    let contactJSON = JSON.stringify({
                        person: newNameValue,
                        phone: newPhoneValue
                    })

                    let request = {
                        method: 'PUT',
                        url: baseServiceUrl + '/' + key + '.json',
                        data:contactJSON
                    };
                    $.ajax(request)
                        .then(loadContacts)
                        .catch(displayError);
                }
            })
            .catch(displayError);

    }


})



