/* global CardshifterServerAPI */

"use strict";

const lobbyController = function() {
    const GLOBAL_USERS = [];
    
    const userDisplay = document.getElementById("lobby_users");
    const chatInput = document.getElementById("lobby_chat_text_area");
    const chatSendButton = document.getElementById("lobby_chat_message_send");
    const chatMessageList = document.getElementById("lobby_chat_messages");
    
    /**
     * Adds a user to the GLOBAL_USERS list.
     * @param {string} username
     * @returns {undefined}
     */
    const addToGlobalUserList = function(username) {
        if (!GLOBAL_USERS.includes(username)) {
            GLOBAL_USERS.push(username);
            GLOBAL_USERS.sort();
        }
        renderUserList();
    };
    
    /**
     * Removes a user from the GLOBAL_USERS list.
     * @param {string} username
     * @returns {undefined}
     */
    const removeFromGlobalUserList = function(username) {
        if (GLOBAL_USERS.includes(username)) {
            for (let i = 0; i < GLOBAL_USERS.length; i++) {
                if (GLOBAL_USERS[i] === username) {
                    GLOBAL_USERS.splice(i, 1);
                }
            }
            GLOBAL_USERS.sort();
            renderUserList();
        }
    };
    
    /**
     * Renders the user list on the page based on the content of GLOBAL_USERS.
     * @returns {undefined}
     */
    const renderUserList = function() {
        userDisplay.innerHTML = "";
        for (let i = 0; i < GLOBAL_USERS.length; i++) {
            const user = document.createElement("li");
            user.innerHTML = GLOBAL_USERS[i];
            userDisplay.appendChild(user);
        }
    };
    
    const handleWebSocketConnection = function() {
        const CHAT_FEED_LIMIT = 10;
        const ENTER_KEY = 13;
        const MESSAGE_DELAY = 3000;
        
        const chatMessages = [];
        let mods = window.availableGameMods || [];
        const currentUser = localStorage.getItem("username");
        const invite = {
            id : null,
            name : null,
            type : null
        };
        let gotInvite = false;
        
        // will be set by either startGame or acceptInvite
        let gameMod = "";
        
        let ping = document.getElementById("ping");
        
        const commandMap = {
//            "userstatus": updateUserList,
//            "chat": addChatMessage,
//            "inviteRequest": displayInvite,
//            "availableMods": displayMods,
//            "newgame": enterNewGame
        };
        
        let getUsers = new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");
        CardshifterServerAPI.sendMessage(getUsers);
        
        CardshifterServerAPI.setMessageListener(function(message) {
            updateUserList(message);
            addChatMessage(message);
        });
        
        /**
         * Updates the GLOBAL_USERS list based on `userstatus` messages from game server.
         * @param {Object} message
         * @returns {undefined}
         * @example message - {command: "userstatus", userId: 2, status: "ONLINE", name: "AI Loser"}
         */
        const updateUserList = function(wsMsg) {
            if (wsMsg.command === "userstatus") {
                logDebugMessage(`SERVER userstatus message: ${JSON.stringify(wsMsg)}`);
                if (wsMsg.status === "ONLINE") {
                    addToGlobalUserList(wsMsg.name);
                }
                else if (wsMsg.status === "OFFLINE") {
                    removeFromGlobalUserList(wsMsg.name);
                }
            }
        };
        
        /**
         * Adds chat message to the lobby on `chat` messages from game server.
         * @param {Object} wsMsg
         * @returns {undefined}
         */
        const addChatMessage = function(wsMsg) {
            if (wsMsg.command === "chat") {
                logDebugMessage(`SERVER chat message: ${JSON.stringify(wsMsg)}`);
                const now = new Date();
                const timeStamp = formatDate(now, "dd-MMM hh:mm");
                const msgText = `${timeStamp} | ${wsMsg.from}: ${wsMsg.message}`;
                const msgElem = document.createElement("li");
                msgElem.innerHTML = msgText;
                msgElem.className = "lobbyChatMessages lobbyChatMessage";
                chatMessageList.appendChild(msgElem);
            }
        };
    };
    
    /**
     * Handles the usage of the user chat textarea and send button. 
     * @returns {undefined}
     */
    const handleUserChatInput = function() {
        const enterKeyCode = 13;
        const newlineRegex = /\r?\n|\r/g;
        const postMessage = function() {
            const msg = chatInput.value.replace(newlineRegex, "");
            if (msg) {
                chatInput.value = null;
                sendChatMessage(msg);     
            }
        };
        chatInput.addEventListener("keyup", function(evt) {
            const code = evt.keyCode;
            if (code === enterKeyCode) {
                postMessage();
            }
        });
    };


    /**
     * Sends a chat message to the server.
     * @param {string} message
     * @returns {undefined}
     */
    const sendChatMessage = function(message) {
        const chatMessage = new CardshifterServerAPI.messageTypes.ChatMessage(message);
        logDebugMessage(`sendChatMessage: ${chatMessage}`);
        CardshifterServerAPI.sendMessage(chatMessage);
    };
    
    
    /**
     * IIFE to control the lobby.
     * @type undefined
     */
    const runLobbyController = function() {
        logDebugMessage("lobbyController called");
        handleWebSocketConnection();
        handleUserChatInput();
    }();
};