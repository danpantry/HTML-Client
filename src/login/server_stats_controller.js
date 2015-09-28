"use strict";

function ServerStatsController(CardshifterServerAPI, $timeout) {
    this.servers = [
        new ServerInfo("Local Host", "ws://127.0.0.1:4243"),
        new ServerInfo("Dwarf Towers", "ws://dwarftowers.com:4243"),
        new ServerInfo("Zomis.net", "ws://stats.zomis.net:4243"),
        new ServerInfo("Other...", "other")
    ];

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
            var thisServer = this.servers[i];

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
                CardshifterServerAPI.addMessageListener({
                    "status": function(message) {
                        /* For some reason, local host always said 1 user online, but dwarftowers did not. */
                        thisServer.userCount = message.users;
                        thisServer.availableMods = message.mods.length;
                        thisServer.gamesRunning = message.games;
                        thisServer.ais = message.ais;

                        // Should these (^^) be dynamically loaded?

                        CardshifterServerAPI.socket.close();
                        CardshifterServerAPI.socket = null;

                        i++;
                        if(this.servers[i]) {
                            getServerInfo();
                        }
                    }
                }, $scope);
            }, function() {
                thisServer.latency = 0;
                thisServer.isOnline = false;
                thisServer.userCount = 0;

                i++;
                if(this.servers[i]) {
                    getServerInfo();
                }
            });
        })();
    };
}

function ServerInfo(name, address) {
    this.name = name;
    this.address = address;
    this.isOnline = false;
    this.userCount = 0;
    this.latency = 0;
    this.availableMods = 0;
    this.gamesRunning = 0;
    this.ais = 0;
}

module.exports = ServerStatsController;