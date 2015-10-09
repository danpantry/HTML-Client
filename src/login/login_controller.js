"use strict";

function LoginController(CardshifterServerAPI, $location, $scope, $timeout, ErrorCreator, CurrentUser) {
    var SUCCESS = 200;
    var UPDATE_DELAY = 10000;
    var REFRESH_DELAY = 3000;

    // see if there is remembered form data
    var loginStorageMap = {
        "CARDSHIFTER_LAST_NAME": "username",
        "CARDSHIFTER_LAST_SERVER": "server",
        "CARDSHIFTER_LAST_OTHER_SERVER": "other_server",
        "CARDSHIFTER_LAST_IS_SECURE": "is_secure"
    };

    for(var storage in loginStorageMap) {
        if(loginStorageMap.hasOwnProperty(storage)) {
            this[loginStorageMap[storage]] = localStorage.getItem(storage) || "";
        }
    }

    /*
    * Called by the login form. This function will send a login
    * request to the server specified in the login form. Upon a
    * successful reply, the code will setup currentUser and
    * redirect to the lobby.
    *
    * This function will not complete if the user has not entered
    * a username, or if there were any errors at all in logging
    * in.
    */
    $scope.login = function() {
        this.loggedIn = true;
        var finalServer = (this.server === "other" ? this.other_server : this.server);

        if(!this.username) {
            ErrorCreator.create("Please enter a username");
            this.loggedIn = false;
            return;
        }

        CardshifterServerAPI.init(finalServer, this.is_secure, function() {

            var login = new CardshifterServerAPI.messageTypes.LoginMessage(this.username);

            CardshifterServerAPI.addMessageListener({
                "loginresponse": function(welcome) {
                    if(welcome.status === SUCCESS && welcome.message === "OK") {
                        CurrentUser.username = this.username;
                        CurrentUser.id = welcome.userid;

                        // for remembering form data
                        for(var storage in loginStorageMap) {
                            if(loginStorageMap.hasOwnProperty(storage)) {
                                localStorage.setItem(storage, this[loginStorageMap[storage]]);
                            }
                        }

                        $location.path("/lobby");
                    } else {
                        console.log("server messsage: " + welcome.message);
                        this.loggedIn = false;
                        this.$apply();
                    }
                }
            }, this);
            CardshifterServerAPI.sendMessage(login);
        }, function() {
            ErrorCreator.create("There was a Websocket-related issue logging in");
            this.loggedIn = false;
        });
    }
}

module.exports = LoginController;
