$(document).ready(function () {

    $('#chat-submit').click(function (e) {
        const message = $('#chat-input').val().trim();

        if (message.length) {
            $('<p>').text(message).appendTo('#chat-output');
            sendToApi(message);
        }
        $('#chat-input').val('');
        e.preventDefault();
    });

    function sendToApi(message) {
        $.ajax({
            type: "POST",
            url: "api/chat.php",
            data: { message: message }
        }).done(function (response) {
            try {
                const jsonResponse = JSON.parse(response);
                $('<p>').text(jsonResponse.text).appendTo('#chat-output');
            } catch (err) {
                console.error("Error parsing the response: ", err);
            }
        }).fail(function (jqXHR, textStatus) {
            console.error("Error sending message to the API: ", textStatus);
        });
    }

});