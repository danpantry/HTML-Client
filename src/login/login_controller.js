"use strict";

function LoginController(CardshifterServerAPI, $location, $rootScope, $timeout, ErrorCreator, CurrentUser) {
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
    * Called by the login form. This function will to the server
    * specified in the login form. Upon a successful reply, the
    * code will setup currentUser and redirect to the lobby.
    *
    * This function will not complete if the user has not entered
    * a username, or if there were any errors at all in logging
    * in (either something with the Socket messed up, or the
    * welcome message response from the server did not contain
    * the properties that would indicate a success)
    */
    this.login = function() {
        this.loggedIn = true;
        var finalServer = (this.server === "other" ? this.other_server : this.server);

        CardshifterServerAPI.init(finalServer, this.is_secure, function() {
            if(this.username) {
                var login = new CardshifterServerAPI.messageTypes.LoginMessage(this.username);

                try {
                    CardshifterServerAPI.setMessageListener(function(welcome) {
                        if(welcome.status === SUCCESS && welcome.message === "OK") {
                            CurrentUser.username = this.username;
                            CurrentUser.id = welcome.userId;

                            // for remembering form data
                            for(var storage in loginStorageMap) {
                                if(loginStorageMap.hasOwnProperty(storage)) {
                                    localStorage.setItem(storage, this[loginStorageMap[storage]]);
                                }
                            }

                            $rootScope.$apply(function() {
                                $location.path("/lobby");
                            });
                        } else {
                            console.log("server messsage: " + welcome.message);
                            this.loggedIn = false;
                            this.$apply();
                        }
                    }, ["loginresponse"]);
                    CardshifterServerAPI.sendMessage(login);

                } catch(e) {
                    // notify the user that there was an issue logging in (loginmessage issue)
                    console.log("LoginMessage error(error 2): " + e);
                    this.loggedIn = false;
                    this.$apply();
                }
            } else {
                console.log("enter a username");
                this.loggedIn = false;
                this.$apply();
            }
        }, function() {
            // notify the user that there was an issue logging in (websocket issue)
            console.log("Websocket error(error 1)");
            this.loggedIn = false;
            this.$apply();
        });
    }
}