"use strict";

function PlayerInfos() {
    return {
        user: {
            index: null,
            id: null,
            name: null,
            animations: {},
            properties: {},
            zones: {}
        },
        opponent: {
            index: null,
            id: null,
            name: null,
            animations: {},
            properties: {},
            zones: {}
        },

        /**
        * Finds and returns a player based on an ID
        *
        * @param id:number -- The ID of the player
        * @param Object -- playerInfos.user
        *               -- playerInfos.opponent
        *               -- null, if the ID does not belong to either player
        */
        find: function(id) {
            if(id === this.playerInfos.user.id) {
                return this.playerInfos.user;
            } else if(id === this.playerInfos.opponent.id) {
                return this.playerInfos.opponent;
            }
            return null;
        }
    };
};

module.exports = PlayerInfos;