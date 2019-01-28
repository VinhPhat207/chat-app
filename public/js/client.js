const socket = io();

// auto scroll to bottom

scrollToBottom = () => {
    let messages = $('#messages');
    let newMessage = messages.children('li:last-child');

    let clientHeight = messages.prop('clientHeight');
    let scrollTop = messages.prop('scrollTop');
    let scrollHeight = messages.prop('scrollHeight');
    let newMessageHeight = newMessage.innerHeight();
    let lastMessageHeight = newMessage.prev().innerHeight();
    
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

// connect and disconnect 
socket.on("connect", () => {
    const { name, room } = $.deparam(window.location.search);
    
    socket.emit("joinRoom", {name, room}, error => {
        if (error) {
            alert(error);
            window.location.href = '/';
        } else {
            console.log("No error");
        }
    });
})

socket.on("disconnect", () => {
    console.log("Disconnected");
})

// Send message
$('#message-form').on('submit', event => {
    event.preventDefault();
    
    const content = $('[name=message]').val();
    const from = $.deparam(window.location.search).name;
    
    if (content) {
        socket.emit('clientSendTextMessage', generateTextMessage(from, content));
        $('[name=message]').val("");
    }
})

$("#send-location").on('click', () => {
    if (!navigator.geolocation) {
        return alert("Old browser does not support")
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const from = $.deparam(window.location.search).name;
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            socket.emit('clientSendLocationMessage', generateLocationMessage(from, lat, lng));
        },
        error => {
            alert(error.message);
        });
})


// Display message
socket.on('serverResponseTextMessage', message => {
    let template = $('#text-message-template').html();
    const { from, content, createAt } = message;

    const html = Mustache.render(template, {
        from, content,
        createAt: moment(createAt).format('hh:mm a'),
    });

    $('#messages').append(html);
    scrollToBottom();
})

socket.on('serverResponseLocationMessage', message => {
    let template = $('#location-message-template').html();
    const {from, url, createAt} = message;

    const html = Mustache.render(template, {
        from, url,
        createAt: moment(createAt).format('hh:mm a'),
    });
    
    $('#messages').append(html);
    scrollToBottom();
})

// Display user list in room

socket.on("updateUserList", users => {
    let ol = $('<ol></ol>');

    users.forEach(user => ol.append($('<li></li>').text(user)));

    $('#users').html(ol);
}) 