(function() {
  'use strict';
  angular.module('AndeysApp').

  // Photo page controller
  controller('PhotoController', ['$filter', 'Database', function($filter, Database) {
    var PhotoCtrl = this;

    // Get all photo data
    Database.getData('photos', function(data) {
      PhotoCtrl.entries = data;

      // Add a pseudo-random ranking
      PhotoCtrl.entries.map(function(entry){
        entry.rank = 0.5 - Math.random();
      });

      // Order by rank
      PhotoCtrl.entries = $filter('orderBy')(PhotoCtrl.entries, 'rank');
      PhotoCtrl.ordering = 'rank';

      // Initial featured image
      PhotoCtrl.currentImage = PhotoCtrl.entries[0];
    });

    // Set the featured image to match a selected thumbnail
    // arg thumbImage: selected thumbnail
    PhotoCtrl.setImageFromThumb = function(thumbImage) {
      PhotoCtrl.currentImage = thumbImage;
    };

    // Switch featured image based on directional movement
    // arg currentImage: current image
    // arg direction: previous or next entry in the array
    PhotoCtrl.switchImage = function(direction) {
      var entryIndex = PhotoCtrl.entries.indexOf(PhotoCtrl.currentImage);

      if (direction === 'prev') {
        if (entryIndex === 0) {
          entryIndex = PhotoCtrl.entries.length - 1;
        }
        else {
          entryIndex -= 1;
        }
      }
      else if (direction === 'next') {
        if (entryIndex === PhotoCtrl.entries.length - 1) {
          entryIndex = 0;
        }
        else {
          entryIndex += 1;
        }
      }
      PhotoCtrl.currentImage = PhotoCtrl.entries[entryIndex];
    }

    // Changes the order by reverse chronological or pseudo-random rank
    // arg order: either order by date or rank
    PhotoCtrl.selectOrder = function(order) {
      if (order === 'date') {
        PhotoCtrl.entries = $filter('orderBy')(PhotoCtrl.entries, '-date');
        PhotoCtrl.ordering = '-date';
      }
      else {
        PhotoCtrl.entries = $filter('orderBy')(PhotoCtrl.entries, 'rank');
        PhotoCtrl.ordering = 'rank';
      }
    };
  }]).

  // Allows scrolling of thumbnails using chevrons
  directive('andeysScroller', function() {
    return {
      restrict: 'E',
      replace: true,
      link: function(scope) {
        var thumbWrapper = angular.element('.thumb-wrapper'),
            scrollLength = thumbWrapper[0].clientWidth,
            leftPosition;

        scope.PhotoCtrl.thumbScroller = function(direction) {
          leftPosition = thumbWrapper.scrollLeft();
          if (direction === 'prev') {
            thumbWrapper.scrollLeft(leftPosition - scrollLength);
          }
          if (direction === 'next') {
            thumbWrapper.scrollLeft(leftPosition + scrollLength);
          }
        };
      },
      template: '<div><a ng-click="PhotoCtrl.thumbScroller(\'prev\')" class="chevron chevron-left"><i class="fa fa-2x fa-chevron-left"></i></a><a ng-click="PhotoCtrl.thumbScroller(\'next\')" class="chevron chevron-right"><i class="fa fa-2x fa-chevron-right"></i></a></div>'
    };
  }).

  // Allows left and right arrows to work on photo slideshow
  directive('andeysSwitchImage', ['$document', function($document) {
    return {
      restrict: 'E',
      replace: true,
      link: function(scope) {

        $document.on('keydown', function(event) {
          if (event.which === 37) {
            scope.$apply(function() {
              scope.PhotoCtrl.switchImage('prev');
            });
          }
          if (event.which === 39) {
            scope.$apply(function() {
              scope.PhotoCtrl.switchImage('next');
            });
          }
        });

      },
      template: '<div><a ng-click="PhotoCtrl.switchImage(\'prev\')" class="slide previous"><div class="arrow"><i class="fa fa-arrow-left"></i></div></a><a ng-click="PhotoCtrl.switchImage(\'next\')" class="slide next"><div class="arrow"><o class="fa fa-arrow-right"></i></div></a></div>'
    };
  }]).

  // Handles image loading delay
  directive('andeysSpinner', function() {
    return {
      restrict: 'E',
      replace: true,
      link: function(scope) {
        var featuredImage = angular.element('.featured-image');
        scope.PhotoCtrl.isLoading = true;
        featuredImage.on('load', function() {
          scope.$apply(function() {
            featuredImage.removeClass('fader');
            scope.PhotoCtrl.isLoading = false;
          });
        });
        scope.$watch('PhotoCtrl.currentImage', function() {
          featuredImage.addClass('fader');
          scope.PhotoCtrl.isLoading = true;
        });
      },
      template: '<div class="spin-overlay" ng-if="PhotoCtrl.isLoading"><i class="fa fa-spinner fa-pulse fa-5x"></i></div>'
    };
  });

})();