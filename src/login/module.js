'use strict';
var angular = require('angular');
var ngRoute = require('angular-route');
var LoginController = require('./login_controller');
var template = require('./login.html');
var serverInterface = require('../server_interface/module');
var ServerStatsController = require('./server_stats_controller');

module.exports = angular.module('cardshifter.login', [ngRoute, serverInterface.name])
  .config(function($routeProvider) {
    $routeProvider.when('/', {
      controller: LoginController,
      template: template
    });
  })
  .controller('ServerStatsController', ServerStatsController)
  .constant('CurrentUser', require('./current_user'));
