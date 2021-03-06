$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $roomInput = $('.roomInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $addStreamButton = $('#addStreamBtn');
  var $getStreamButton = $('#getStreamBtn');
  var $getStreamButton = $('#getStreamBtn');
  //var $roomInput = $('#room');
  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var room;
  var username = 'Ed Username';
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $roomInput.focus();

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setRoom () {
    room = cleanInput($roomInput.val().trim());

    // If the username is valid
    if (room) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your room
      socket.emit('join room', JSON.stringify({
        room: room,
        user: {
          id: 1,
          name: 'Edo'
        }
      }));
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    //message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message) {
      $inputMessage.val('');
      addChatMessage({
        user: {
          id: 123,
          name: 'edo'
        },
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('send message', JSON.stringify({
        user: { id: 1, name: 'edo' },
        message: message
      }));
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.user.name)
      .css('color', getUsernameColor(data.user.name));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.user.name)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).html();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (room) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setRoom();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events
  $addStreamButton.click(function(){
    socket.emit('add stream', JSON.stringify(
      { 
        user: {
          name: 'edo',
          id: 1
        },
        streamId:  Math.random().toString(36).substring(7)
      }));
  });

  $getStreamButton.click( function(){
    socket.emit('get room details', JSON.stringify(
      { 
        user: {
          name: 'edo',
          id: 1
        }
      }));
  })

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events
  socket.on('connect', function() {
    console.log('Connected');
  });

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat ??? ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  
  socket.on('participant joined', function (data) {
    console.log('Participant Joined: ', JSON.parse(data));
  });

  socket.on('participant left', function (data) {
    console.log('Participant Left: ', JSON.parse(data));
  });

  socket.on('stream added', function(data){
    console.log('Stream Added: ', JSON.parse(data));
  });

  socket.on('room details', function(data){
    console.log('Room Details: ', JSON.parse(data));
  })

  socket.on('stream removed', function(data){
    console.log('Stream Removed');
  })
  // Whenever the server emits 'new message', update the chat body
  socket.on('message sent', function (data) {
    console.log('Message Sent: ', JSON.parse(data));
    addChatMessage(data);
  });

  // // Whenever the server emits 'user joined', log it in the chat body
  // socket.on('user joined', function (data) {
  //   log(data.username + ' joined');
  //   addParticipantsMessage(data);
  // });

  // // Whenever the server emits 'user left', log it in the chat body
  // socket.on('user left', function (data) {
  //   log(data.username + ' left');
  //   addParticipantsMessage(data);
  //   removeChatTyping(data);
  // });

  // // Whenever the server emits 'typing', show the typing message
  // socket.on('typing', function (data) {
  //   addChatTyping(data);
  // });

  // // Whenever the server emits 'stop typing', kill the typing message
  // socket.on('stop typing', function (data) {
  //   removeChatTyping(data);
  // });

  socket.on('disconnect', function () {
    console.log('you have been disconnected');
  });

  socket.on('reconnect', function () {
    log('Reconnected. Socket Id:', socket.id);
    socket.emit('join room', JSON.stringify({
      room: room,
      user: {
        id: 1,
        name: 'Edo',
      }
    }));
  });

  socket.on('reconnect_error', function () {
    log('attempt to reconnect has failed');
  });

});
