function attachEvents() {
    const basUrl = 'https://baas.kinvey.com/appdata/kid_HyPjjII5M/allBooks';
    const kinveyUsername = 'guest';
    const kinveyPassword = 'guest';
    const base64auth = btoa(kinveyUsername + ':' + kinveyPassword);
    const authHeaders = {
        'Authorization': 'Basic ' + base64auth,
        'Content-Type': 'application/json'
    };

    $('.load').click(loadAllBooks);
    $('.create').click(createBook);

    function request(method, endpoint, data) {
        return $.ajax({
            method: method,
            url: basUrl + endpoint,
            headers: authHeaders,
            data: JSON.stringify(data)
        });
    }

    function loadAllBooks() {
        request('GET','')
            .then(displayAllBooks)
            .catch(handleError);
    }


    function displayAllBooks(books) {
        let allBooks = $('#books');
        allBooks.empty();
        for (let book of books) {
            allBooks.append($(`<div class="book" data-id="${book['_id']}">`)
                .append($('<label>').text('Title'))
                .append($(`<input type="text" class="title" value="${book['title']}">`))
                .append($('<label>').text('Author'))
                .append($(`<input type="text" class="author" value="${book['author']}">`))
                .append($('<label>').text('Isbn'))
                .append($(`<input type="number" class="isbn" value="${book['isbn']}">`))
                .append($('<button>[Edit]</button>').click(editBook))
                .append($('<button>[Delete]</button>').click(deleteBook)))
        }

    }
    function createBook(event) {
        event.preventDefault();
        let title = $('#title');
        let author = $('#author');
        let isbn = $('#isbn');

        let createBookData = {
            title: title.val(),
            author: author.val(),
            isbn: Number(isbn.val())
        };

        request('POST', '', createBookData)
            .then(loadAllBooks)
            .catch(handleError);

        title.val('');
        author.val('');
        isbn.val('');
    }

    function editBook() {
        let book = $(this).parent();

        let bookObj = {
            title: book.find('.title').val(),
            author: book.find('.author').val(),
            isbn: Number(book.find('.isbn').val())
        }
        request('PUT', `/${book.attr('data-id')}`, bookObj)
            .then(loadAllBooks)
            .catch(handleError);

    }

    function deleteBook() {
        let bookId = $(this).parent().attr('data-id');
        request('DELETE', `/${bookId}`)
            .then(loadAllBooks)
            .catch(handleError);

    }

    function handleError(err) {
        $('#books').text(err.statusText);
    }
}
