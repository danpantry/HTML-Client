"use strict";

function ChatController(CardshifterServerAPI, $timeout, ErrorCreator) {
    var CHAT_FEED_LIMIT = 10;
    var ENTER_KEY = 13;
    var MESSAGE_DELAY = 3000;

    $scope.chatMessages = [];

    var ping = document.getElementById("ping"); // is this angulary?

    /**
    * This function is called when the user hits the "Send" button
    * write text to the chat message text box.
    *
    * Upon click the send button or hitting the enter key, this function
    * will send a new ChatMessage to the server. Then, the clear the
    * chat message input box and disable use of the send button
    * for the time specified in MESSAGE_DELAY
    */
    this.sendMessage = function(e) {
        if(e && e.keyCode !== ENTER_KEY) { // user may hit "enter" key
            return;
        }
        if(this.sending) { // enter key bypasses button disable
            ErrorCreator.create("You must wait 3 seconds between after sending a chat message before you may send a new one");
            return;
        }

        this.sending = true;
        var chatMessage = new CardshifterServerAPI.messageTypes.ChatMessage($scope.user_chat_message);
        CardshifterServerAPI.sendMessage(chatMessage);

        this.user_chat_message = ""; // clear the input box
        $timeout(function() { // allow another message to be sent in 3 seconds
            this.sending = false;
        }, MESSAGE_DELAY);
    };
}

module.exports = ChatController;