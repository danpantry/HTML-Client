'use strict';

// @ngInject
function DeckbuilderController(CardshifterServerAPI, $rootScope, $location, ErrorCreator) {
    var DECK_STORAGE = "CARDSHIFTER_DECK_STORAGE";

    this.cards = [];
    this.maxCards = 0;
    this.minCards = 0;
    this.currentDeck = {};
    this.cardInfo = null;
    this.currentDeckName = "untitled";
    this.savedDecks = [];
    this.doneLoading = false;
    this.enteringGame = currentUser.game.id;

    // This is sort of a repeat of currentDeck, because I didn't know that the client had to send the message back
    var deckConfig = null; // the message received from the server

    if(!localStorage.getItem(DECK_STORAGE)) {
        var mods = {};
        for (var i in availableGameMods) {
            mods[availableGameMods[i]] = [];
        }
        var json = JSON.stringify({
            decks: mods
        });
        localStorage.setItem(DECK_STORAGE, json);
    }

    CardshifterServerAPI.setMessageListener({
        "playerconfig": function(cardInformation) {
            deckConfig = cardInformation
            var deck = cardInformation.configs.Deck;

            for(var card in deck.cardData) {
                if(deck.cardData.hasOwnProperty(card)) {
                    deck.cardData[card].max = deck.max[card] || deck.maxPerCard;
                    this.currentDeck[deck.cardData[card].id] = 0;
                }
            }

            this.cards = deck.cardData;
            this.maxCards = deck.maxSize;
            this.minCards = deck.minSize;
            updateSavedDecks();
            this.doneLoading = true;
        }
    }, this);

    /**
    * This is called when the minus-sign button for a card
    * has been clicked.
    *
    * This function will, based on the argument, will reduce
    * the amount of this card the user has by one. This can
    * not go below 0.
    *
    * @param card:Object -- The card to decrement
    */
    this.decrement = function(card) {
        if(this.currentDeck[card.id] !== 0) {
            this.currentDeck[card.id]--;
        }
    };
    /**
    * This is called when the plus-sign button for a card
    * has been clicked.
    *
    * This function will, based on the argument, will
    * increase the amount of this card the user has by one.
    *
    * This can not go above the card's maximum limit, nor
    * can it go above the deck limit.
    *
    * @param card:Object -- The card to increment
    */
    this.increment = function(card) {
        if(this.getTotalSelected() !== this.maxCards &&
           this.currentDeck[card.id] !== card.max) {
            this.currentDeck[card.id]++;
        }
    };

    /**
    * This is called by injection near the top of the document
    * to, in fractional form, how many cards are in the user's
    * current deck.
    */
    this.getTotalSelected = function() {
        var total = 0;
        for(var card in this.currentDeck) {
            if(this.currentDeck.hasOwnProperty(card)) {
                total += this.currentDeck[card];
            }
        }
        return total;
    };

    /**
    * This is called when the card link of a card in the
    * available cards table has been clicked.
    *
    * Once this function is called, it loads this.cardInfo
    * with the card object associated with the link that was
    * clicked and will simply stick it into a card directive
    * which is displayed at the top of the screen.
    *
    * TODO: Dynamically load this.cardInfo with card properties. #60
    */
    this.showDetails = function(card) {
        this.cardInfo = card;
    };

    /**
    * This is called by the "save deck" button at the bottom of the
    * screen. This function stores all the currently selected cards
    * in Local Storage.
    *
    * If the user has not selected enough cards, not given the deck
    * a name, or has given it name but it already exists, this function
    * will stop immediately.
    */
    this.saveDeck = function() {
        if(this.getTotalSelected() !== this.minCards) {
            ErrorCreator.create("Not enough cards");
            return;
        }
        if(!this.deckName) {
            ErrorCreator.create("Please enter a name");
            return;
        }
        if(getDeckIndex(this.deckName)) {
            ErrorCreator.create("A deck with that name already exists");
            return;
        }

        var savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE));

        var newDeck = {
            name: this.deckName,
            cards: this.currentDeck
        };

        savedDecks.decks[currentUser.game.mod].push(newDeck);
        localStorage.setItem(DECK_STORAGE, JSON.stringify(savedDecks));
        updateSavedDecks();

        this.switchDeck(newDeck);
    };

    /**
    * This function is called when the deck link of a deck
    * is clicked. This function will load the deck information
    * from Local Storage and display it on the screen in the
    * card table.
    *
    * @param deck:Object -- The deck to load
    */
    this.switchDeck = function(deck) {
        this.currentDeckName = deck.name;
        this.currentDeck = deck.cards;
    };

    /**
    * This function is called when the "delete" button next
    * to a deck name near the bottom of the page is clicked.
    *
    * This function will remove the specified deck from
    * Local Storage, and from the list at the bottom of the
    * screen.
    *
    * @param deckName:string -- The name of the deck to delete
    */
    this.deleteDeck = function(deckName) {
        var savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE));
        savedDecks.decks[currentUser.game.mod].splice(getDeckIndex(deckName), 1);
        localStorage.setItem(DECK_STORAGE, JSON.stringify(savedDecks));

        updateSavedDecks();
    };

    /**
    * This function is called when the "start game" button near the
    * bottom of the page is clicked. This function will not run
    * if the user has not selected enough cards.
    *
    * The "start game" button is only displayed if this deck builder
    * screen was opened via starting a new game from the lobby.
    *
    * This function will send all the deck information to the server
    * and then redirect to the game board screen.
    */
    this.enterGame = function() {
        if(this.getTotalSelected() === this.minCards) {

            // remove all unpicked cards from the deck like the Java client(needed?)
            for(var card in this.currentDeck) {
                if(this.currentDeck.hasOwnProperty(card)) {
                    if(this.currentDeck[card] === 0) {
                        delete this.currentDeck[card];
                    }
                }
            }

            // remove all .max properties so server does not die
            for(var card in deckConfig.configs.Deck.cardData) {
                delete deckConfig.configs.Deck.cardData[card].max;
            }

            deckConfig.configs.Deck.chosen = this.currentDeck;
            CardshifterServerAPI.sendMessage(deckConfig);

            $location.path("/game_board");
        } else {
            ErrorCreator.create("Not enough cards");
            console.log("not enough cards");
        }
    };

    /**
    * This function is called once the "go back to the lobby" button
    * near the bottom of the page is clicked.
    *
    * This button is only visible if the deck builder was entered
    * via the "deck builder" button in the game lobby.
    *
    * This function simply redirects the page back to the lobby
    * screen.
    */
    this.goBack = function() {
        $location.path("/lobby");
    };

    /**
    * This function updates the this variable savedDecks with the
    * saved decks that are stored in Local Storage.
    *
    * This function will only load this.savedDecks with the decks of
    * the mod that the game or user specified.
    */
    function updateSavedDecks() {
        this.savedDecks = JSON.parse(localStorage.getItem(DECK_STORAGE)).decks[currentUser.game.mod];
    }

    /**
    * This function will search through all the saved decks in
    * this.savedDecks and try to find the deck with the name
    * deckName.
    *
    * @param deckName:string -- The name of the deck to look for.
    * @return number/boolean -- The index of the deck with the correct name in this.savedDecks
    *                        -- false if the deck was not found in this.savedDecks
    */
    function getDeckIndex(deckName) {
        for(var i = 0, length = this.savedDecks.length; i < length; i++) {
            if(this.savedDecks[i].name === deckName) {
                return i;
            }
        }
        return false;
    }
}

module.exports = DeckbuilderController;
