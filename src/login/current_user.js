"use strict";

function CurrentUser() {
    return {
        username: null,
        id: null,
        playerIndex: null,
        game: {
            id: null,
            mod: null
        }
    }
}

module.exports = CurrentUser;