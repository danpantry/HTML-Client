"use strict";

function ChatController(CardshifterServerAPI, $timeout, ErrorCreator) {
    var CHAT_FEED_LIMIT = 10;
    var ENTER_KEY = 13;
    var MESSAGE_DELAY = 3000;

    this.chatMessages = [];

    var ping = document.getElementById("ping"); // is this angulary?

    CardshifterServerAPI({
        "chat": addChatMessage
    }, $scope);

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
        var chatMessage = new CardshifterServerAPI.messageTypes.ChatMessage(this.user_chat_message);
        CardshifterServerAPI.sendMessage(chatMessage);

        this.user_chat_message = ""; // clear the input box
        $timeout(function() { // allow another message to be sent in 3 seconds
            this.sending = false;
        }, MESSAGE_DELAY);
    };

    /**
    * Adds a chat message to the message feed. If the message
    * feed is at the maximum limit of messages, deletes the oldest
    * message.
    */
    function addChatMessage(message) {
        if(this.chatMessages.length === CHAT_FEED_LIMIT) {
            // remove the oldest chat message
            this.chatMessages.shift();
        }

        var now = new Date();

        var YMD = [formatTimeNumber(now.getFullYear()), formatTimeNumber(now.getMonth() + 1), formatTimeNumber(now.getDate())].join('-');
        var HMS = [formatTimeNumber(now.getHours()), formatTimeNumber(now.getMinutes()), formatTimeNumber(now.getSeconds())].join(':');
        message.timestamp = YMD + " " + HMS;

        this.chatMessages.push(message);
    };

    /**
    * If a number is less than 10, this function will
    * return a '0' appended to the beginning of that number
    *
    * This allows for cleanly formatted timestamps on chat messages.
    *
    * @param time:number -- The number to check
    * @param string -- If the number is less than 10, '0' + time
                    -- If not, just time itself.
    */
    function formatTimeNumber(time) {
        return time < 10 ? "0" + time : time;
    };
}

module.exports = ChatController;