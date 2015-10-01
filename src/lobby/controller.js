'use strict';

// @ngInject
function LobbyController(CardshifterServerAPI, $timeout, $rootScope, $location, ErrorCreator) {
    this.users = [];
    this.mods = window.availableGameMods || [];

    var commandMap = {
        "userstatus": updateUserList,
        "availableMods": displayMods,
        "error": displayError
    };

    var getUsers = new CardshifterServerAPI.messageTypes.ServerQueryMessage("USERS", "");
    CardshifterServerAPI.sendMessage(getUsers);

    CardshifterServerAPI.addMessageListener(commandMap, $scope);


    // The command map functions:
    /**
    * Based on the content of message, will add or remove
    * a user from the user list.
    */
    function updateUserList(message) {
        if(message.status === "OFFLINE") {
            for(var i = 0, length = this.users.length; i < length; i++) {
                if(this.users[i].userId === message.userId) {
                    this.users.splice(i, 1); // remove that user from the array
                    return;
                }
            }
        } else {
            this.users.push(message);
        }
    };
    /**
    * Shows to the user a list of all available mods.
    */
    function displayMods(message) {
        window.availableGameMods = message.mods; // for deck builder and for returning to this page
        this.mods = message.mods;
    };

    function displayError(message) {
        ErrorCreator.create(message.message);
    }
}

module.exports = LobbyController;
