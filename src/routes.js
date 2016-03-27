import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './index.js';
import Login from "./scenes/login";
import Lobby from "./scenes/lobby";
import DeckBuilder from "./scenes/deck_builder";
import GameScreen from "./scenes/game_screen";

export default (
    <Route path="/" component={App}>
        <IndexRoute component={Login}/>
        <Route path="login" component={Login}/>
        <Route path="lobby" component={Lobby}/>
        <Route path="deck_builder" component={DeckBuilder}/>
        <Route path="game_screen" component={GameScreen}/>
    </Route>
);