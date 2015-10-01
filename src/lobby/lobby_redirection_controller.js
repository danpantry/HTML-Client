function LobbyRedirectionController(CardshifterServerAPI, CurrentUser, $location, ErrorCreator) {
    var gameMod = "";

    CardshifterServerAPI.addMessageListener({
        "newgame": enterNewGame
    })

    /**
    * This function is called when the user has chosen a mod,
    * selected an opponent, and hit the "invite" button.
    *
    * This function sends a StartGameRequest to the server.
    */
    $scope.startGame = function() {
        if($scope.selected_mod && $scope.selected_opponent) {
            var startGame = new CardshifterServerAPI.messageTypes.StartGameRequest($scope.selected_opponent,
                                                                                   $scope.selected_mod);
            CardshifterServerAPI.sendMessage(startGame);
            gameMod = $scope.selected_mod;
        } else {
            // Error if user has not chosen a mod or opponent
            ErrorCreator.create("Select both a game type and an opponent user before you can start a game.");
        }
    };

    /**
    * This function is called once the user has selected a mod
    * and has clicked the "Deck Builder" button near the top of the
    * screen. If the user has not yet selected a mod, then this
    * function does nothing.
    *
    * Once this is run, a ServerQueryMessage is sent to the server
    * to retrieve all the cards. The reason why this has to be sent
    * manually is because the server does not know when the user
    * is entering the deck builder, so it does not know to send
    * the card information automatically, as opposed to if the user
    * were entering a new game.
    */
    $scope.openDeckBuilder = function() {
        if($scope.selected_mod) {
            CurrentUser.game.mod = $scope.selected_mod;

            var getCards = new CardshifterServerAPI.messageTypes.ServerQueryMessage("DECK_BUILDER", currentUser.game.mod);
            CardshifterServerAPI.sendMessage(getCards);
            $location.path("/deck_builder");
        } else {
            ErrorCreator.create("Select a game type before you can open the deck builder.");
        }
    };

    /**
    * Stores the game ID in currentUser for other controllers
    * to use and navigates to the deck-builder page for the
    * user to select a deck.
    */
    function enterNewGame(message) {
        CurrentUser.game.id = message.gameId;
        CurrentUser.game.mod = gameMod;
        CurrentUser.game.playerIndex = message.playerIndex;

        $location.path("/deck_builder");
    };
}