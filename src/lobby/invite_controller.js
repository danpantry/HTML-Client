"use strict";

function InviteController(CardshifterServerAPI) {
    this.invite = {
        id: null,
        name: null,
        type: null
    };
    this.gotInvite = false;

    CardshifterServerAPI.addMessageListener({
        "invite": displayInvite
    }, $scope);

    /**
    * This function is called when either the "accept" or "decline"
    * button of the invite pop-up has been clicked.
    *
    * This function sends an InviteResponse message to the server and
    * and passes in the accept argument to the constructor. If the
    * user hit "accept", then the accept argument will be true. If
    * the user hit "decline", then the accept argument will be false.
    *
    * @param accept:boolean -- true for "accept"
                            -- false for "decline"
    */
    this.acceptInvite = function(accept) {
        var accept = new CardshifterServerAPI.messageTypes.InviteResponse(this.invite.id, accept);
        CardshifterServerAPI.sendMessage(accept);

        gameMod = this.invite.type;
        this.gotInvite = false;
    };

    /**
    * Shows buttons and a message to this client for accepting
    * or declining a game request.
    */
    function displayInvite(message) {
        this.invite.id = message.id;
        this.invite.name = message.name;
        this.invite.type = message.gameType;
        this.gotInvite = true;

        ping.play();
    };
}

module.exports = InviteController;