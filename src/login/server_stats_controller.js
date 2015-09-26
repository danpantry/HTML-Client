"use strict";

function ServerStatsController(CardshifterServerAPI, ServerList, $timeout) {
    this.refreshServers = function() {
        this.refreshing = true;
        $timeout(function() {
            this.refreshing = false;
        }, REFRESH_DELAY);

        /**
        * This is a recursive function that is called
        * once the Websocket has successfully connected
        * with the server. Once it is connected, the
        * Websocket is obliterated.
        *
        * This is used in place of the loop because
        * API.init is a mostly async method, so the
        * loop would rapidly terminate, and the sockets
        * will be destroyed at the incorrect points in
        * order for the "blank users"(#92) to be prevented.
        */
        var i = 0;
        (function getServerInfo() {
            var thisServer = ServerList.servers[i];

            if(thisServer.name === "Other...") {
                return;
            }

            var now = Date.now();

            CardshifterServerAPI.init(thisServer.address, false, function() {
                thisServer.latency = Date.now() - now;
                thisServer.isOnline = true;

                /* This must be created here because this is run after init is don't, so command is set properly */
                var getUsers = new CardshifterServerAPI.messageTypes.ServerQueryMessage("STATUS", "");

                CardshifterServerAPI.sendMessage(getUsers);
                CardshifterServerAPI.setMessageListener(function(message) {

                    /* For some reason, local host always said 1 user online, but dwarftowers did not. */
                    thisServer.userCount = message.users;
                    thisServer.availableMods = message.mods.length;
                    thisServer.gamesRunning = message.games;
                    thisServer.ais = message.ais;

                    // Should these (^^) be dynamically loaded?

                    CardshifterServerAPI.socket.close();
                    CardshifterServerAPI.socket = null;

                    i++;
                    if(ServerList.servers[i]) {
                        getServerInfo();
                    }
                }, ["status"]);
            }, function() {
                thisServer.latency = 0;
                thisServer.isOnline = false;
                thisServer.userCount = 0;

                i++;
                if(ServerList.servers[i]) {
                    getServerInfo();
                }
            });
        })();
    };
}

module.exports = ServerStatsController;