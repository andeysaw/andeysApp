(function() {
  'use strict';
  angular.module('AndeysApp').

  // Controller for the travelog page
  controller('TravelogController', ['$timeout', 'Database', function($timeout, Database) {
    var TravelogCtrl = this,

    // Initial amount of travelogs to load
        loadSize = 9;
   
    // Get all travelog data
    Database.getData('travelogs', function(data){
      TravelogCtrl.entries = data;
    });

    // Initially load background images of a set number of travelog cards
    // arg tripTitle: the title of the travelog card
    // arg position: position of the travelog in the array
    TravelogCtrl.initBackground = function(tripTitle, position) {
      if (position < loadSize) {
        var tripName = tripTitle.replace(/\s+/g, '-').toLowerCase();
        return 'url(/assets/images/covers/' + tripName + '.jpg)';
      }
    }

    // Animate the travelog card upon hover
    // arg $event: targeted for modification
    TravelogCtrl.animateSelection = function($event) {
      var listElement = angular.element($event.delegateTarget);
      listElement.addClass('trip-entry-select');
      $timeout(function() {
        listElement.removeClass('trip-entry-select');
      }, 150);
    };
  }]).

  // Allows lazy loading on trip list
  directive('andeysBackgroundLoad', ['$window', function($window) {
    return function(scope, element, attribute) {
      var windowElement = angular.element($window),
          entryName,
          handler = function() {
        if (windowElement.scrollTop() + windowElement.height() >= element.offset().top) {
          entryName = attribute.andeysBackgroundLoad.replace(/\s+/g, '-').toLowerCase();
          element.css('background-image', 'url(/assets/images/covers/' + entryName + '.jpg)');
        }
      };
      windowElement.on('scroll resize', scope.$apply.bind(scope, handler));
      handler();
    };
  }]);

})();