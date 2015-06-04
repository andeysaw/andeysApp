// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

(function() {
  'use strict';
  // Angular App
  angular.module('AndeysApp', [
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'mm.foundation'
  ]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/intro', {
        templateUrl: 'templates/intro.html',
      }).
      when('/photos', {
        templateUrl: 'templates/photos.html',
        controller: 'PhotoController',
        controllerAs: 'PhotoCtrl'
      }).
      when('/travelogs', {
        templateUrl: 'templates/travelogs.html',
        controller: 'TravelogController',
        controllerAs: 'TravelogCtrl'
      }).
      when('/travelogs/:tripDate', {
        templateUrl: 'templates/trip.html',
        controller: 'TripController',
        controllerAs: 'TripCtrl'
      }).
      when('/waterfalls', {
        templateUrl: 'templates/waterfalls.html',
        controller: 'ListController',
        controllerAs: 'ListCtrl'
      }).
      otherwise({
        redirectTo: '/intro'
      });
  }]);
})();