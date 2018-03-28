function attachEvents() {
    $('#refresh').click(attachRefresh);
    $('#submit').click(sendMessage);

    function attachRefresh() {
        $.get('https://messenger-5e86c.firebaseio.com/messenger/.json')
            .then(displayAllMessages);
    }

    function displayAllMessages(allMessages) {
        let textArea = $('#messages');
        let output = '';
        for (let message in allMessages) {
            output += `${allMessages[message]['author']}: ${allMessages[message]['content']}\n`;
        }
        textArea.text(output);
    }
    function sendMessage() {
        let message={
            "author":$('#author').val(),
            "content": $('#content').val(),
            "timestamp":Date.now()
        };

        let request={
            url:'https://messenger-5e86c.firebaseio.com/messenger/.json',
            method: 'POST',
            data: JSON.stringify(message),
            success: attachRefresh
        };

        $.ajax(request);
    }
}
