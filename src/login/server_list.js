"use strict";

/**
* The ServerInfo class.
* @constructor
*
* @param name:string -- The name of the server
* @param address:string -- The address of the server
*
* This class is used for displaying the various
* available servers at the top of the screen
* in the server status table.
*/
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

function ServerListFactory() {
    return {
        servers: [
            new ServerInfo("Local Host", "ws://127.0.0.1:4243"),
            new ServerInfo("Dwarf Towers", "ws://dwarftowers.com:4243"),
            new ServerInfo("Zomis.net", "ws://stats.zomis.net:4243"),
            new ServerInfo("Other...", "other")
        ]
    };
}

module.exports = ServerListFactory;