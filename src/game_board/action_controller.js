"use strict";

function ActionController(CardshifterServerAPI, ErrorCreator, PlayerInfos) {
    this.actions = [];
    this.currentAction = {};
    this.doingAction = false;
    this.targets = [];
    this.selected = [];
    this.targetsMessage = {};

    this.startAction = function(action) {
        if(!action.targetRequired) { // No targets? No confirmation. Do we understand each other?
            this.currentAction = action;
            var doAbility = new CardshifterServerAPI.messageTypes.UseAbilityMessage(currentUser.game.id,
                                                                                this.currentAction.id,
                                                                                this.currentAction.action);

            CardshifterServerAPI.sendMessage(doAbility);
            this.cancelAction();
            return;
        }

        // if a target is required, request targets
        var getTargets = new CardshifterServerAPI.messageTypes.RequestTargetsMessage(currentUser.game.id,
                action.id, action.action);
        CardshifterServerAPI.sendMessage(getTargets);

        this.currentAction = action;
        this.doingAction = true;
    };

    this.cancelAction = function() {
        this.doingAction = false;
        this.targets = [];
        for (var i = 0; i < this.selected.length; i++) {
            this.selected[i].selected = false;
        }
        this.selected = [];
    };

    this.performAction = function() {
        var action = this.currentAction;
        var selected = this.selected;
        var minTargets = this.targetsMessage.min;
        var maxTargets = this.targetsMessage.max;
        if (selected.length < minTargets || selected.length > maxTargets) {
            ErrorCreator.create("target(s) required: " + minTargets + " - " + maxTargets + " but chosen " + selected.length);
            return;
        }

        var doAbility = null;

        var selectedIDs = [];
        for(var i = 0, length = this.selected.length; i < length; i++) {
            selectedIDs.push(this.selected[i].id);
        }

        var doAbility = new CardshifterServerAPI.messageTypes.UseAbilityMessage(currentUser.game.id,
                                                                                this.currentAction.id,
                                                                                this.currentAction.action,
                                                                                selectedIDs);

        CardshifterServerAPI.sendMessage(doAbility);
        this.cancelAction();
    };

    /**
    * Resets all the available actions that the user has.
    */
    function resetActions() {
        this.actions = [];
    };

    /**
    * Adds another possible action to the possible actions
    * that this user can complete on their turn.
    *
    * @param action:UsableActionMessage -- The action to add
    *
    * This will only add the action to this.actions if there
    * is not another action with the same name in there.
    */
    function addUsableAction(action) {
        var actions = this.actions;

        if(PlayerInfos.findPlayer(action.id)) { // ID is not target
            action.isPlayer = true;
            var notDuplicate = true;

            for(var i = 0, length = actions.length; i < length; i++) {
                if(actions[i].action === action.action) { // not a duplicate
                    notDuplicate = false;
                    break;
                }
            }

            if(notDuplicate) {
                actions.push(action);
            }
        } else { // ID is target
            action.isPlayer = false;
            actions.push(action);
        }
    };
}

module.exports = ActionController;