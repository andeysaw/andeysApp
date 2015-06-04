(function() {
  'use strict';
  angular.module('AndeysApp').

  // Controller for list page
  controller('ListController', ['$modal', 'Database', 'Geocode', function($modal, Database, Geocode) {
    var ListCtrl = this;

    // Initial order of list
    ListCtrl.ordering = ['country','location','place', 'name'] ;

    // Get all list data
    Database.getData('lists', function(data) {
      ListCtrl.entries = data;

      // Rank list by distance from inputted location
      ListCtrl.getDistanceRank = function() {
        if (ListCtrl.location) {
          var address = encodeURI(ListCtrl.location).replace(/%20/g, "+");

          Geocode.googleGeocode(address, function(data) {
            ListCtrl.errorMsg = null;
            ListCtrl.firstResult = null;
            if (data.results.length > 1) {
              ListCtrl.firstResult = data.results[0].formatted_address;
              ListCtrl.errorMsg = null;
            }

            var startCoords = {
              latitude: data.results[0].geometry.location.lat,
              longitude: data.results[0].geometry.location.lng
            };
            createRank(startCoords, ListCtrl.entries);
          }, function(error) {
              ListCtrl.errorMsg = error;
              ListCtrl.firstResult = null;
          });
        }
      };

    //   ListCtrl.getMyLocation = function() {
    //     if (navigator.geolocation) {
    //       navigator.geolocation.getCurrentPosition(function(position) {
    //         ListCtrl.errorMsg = null;
    //         ListCtrl.firstResult = null;
    //         var startCoords = {
    //           latitude: position.coords.latitude,
    //           longitude: position.coords.longitude
    //         };
    //         createRank(startCoords, ListCtrl.entries);
    //       }, displayError);
    //     }
    //   };
    });

    // Create list photo model and assign a controller
    ListCtrl.openPhotoModal = function (entry) {
      var modalInstance = $modal.open({
        template: '<h4 class="text-center" data-ng-bind-html="ModalListPhotoCtrl.name"></h4><figure class="modal text-center"><img data-ng-src="{{ModalListPhotoCtrl.filepath}}"><figcaption data-ng-bind-html="ModalListPhotoCtrl.description"></figcaption></figure><a class="close-reveal-modal" data-ng-click="ModalListPhotoCtrl.close()">&#215;</a>',
        controller: 'ModalListPhotoController',
        controllerAs: 'ModalListPhotoCtrl',
        resolve: {
          entry: function () {
            return entry;
          }
        }
      });
    };

    // Create list map model and assign a controller
    ListCtrl.openMapModal = function (entry) {
      var modalInstance = $modal.open({
        template: '<h4 class="text-center" data-ng-bind-html="ModalListMapCtrl.name"></h4><figure class="modal text-center"><img data-ng-src="{{ModalListMapCtrl.filepath}}"><figcaption data-ng-bind-html="ModalListMapCtrl.description"></figcaption></figure><a class="close-reveal-modal" data-ng-click="ModalListMapCtrl.close()">&#215;</a>',
        controller: 'ModalListMapController',
        controllerAs: 'ModalListMapCtrl',
        resolve: {
          entry: function () {
            return entry;
          }
        }
      });
    };

  // Geolocation errors
    // function displayError(error) {
    //   switch(error.code) {
    //     case error.PERMISSION_DENIED:
    //       ListCtrl.errorMsg = "Request for geolocation denied by user."
    //       break;
    //     case error.POSITION_UNAVAILABLE:
    //       ListCtrl.errorMsg = "Location information is unavailable."
    //       break;
    //     case error.TIMEOUT:
    //       ListCtrl.errorMsg = "The request to get user location timed out."
    //       break;
    //     case error.UNKNOWN_ERROR:
    //       ListCtrl.errorMsg = "An unknown geolocation error occurred."
    //       break;
    //   }
    // }

    // Create a rank of waterfall distances from a coordinate
    // arg startCoords: inputted coordinates
    // arg entries: list in use
    function createRank(startCoords, entries) {
      var destCoords = {latitude:'',longitude:''};

      entries.map(function(entry){
        destCoords = {
          latitude: entry.latitude,
          longitude: entry.longitude
        };
        entry.rank = Geocode.computeDistance(startCoords, destCoords);
      });

      ListCtrl.ordering = 'rank';
    }
  }]).

  // Controller for list photo modals
  controller('ModalListPhotoController', ['$modalInstance', 'entry', function ($modalInstance, entry) {
    var ModalListPhotoCtrl = this;
    ModalListPhotoCtrl.name = entry.name;
    ModalListPhotoCtrl.description = entry.description;
    ModalListPhotoCtrl.filepath = '/assets/images/lists/' + entry.date.substr(0,4) + '/' + entry.date.substr(5,2) + '/' + entry.filename + '.jpg';

    ModalListPhotoCtrl.close = function () {
      $modalInstance.dismiss('close');
    };
  }]).

  // Controller for list map modals
  controller('ModalListMapController', ['$modalInstance', 'entry', function ($modalInstance, entry) {
    var ModalListMapCtrl = this;
    ModalListMapCtrl.name = 'Map: ' + entry.name;
    ModalListMapCtrl.description = entry.place + ', ' + entry.location + ', ' + entry.country;
    ModalListMapCtrl.filepath = 'https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyCqfFNFVyDEaoex6dH6y4AyjchN5214Vnc&zoom=12&size=640x640&maptype=terrain&markers=' + entry.latitude + ',' + entry.longitude;

    ModalListMapCtrl.close = function () {
      $modalInstance.dismiss('close');
    };
  }]).

  // Compute radial distances
  factory('Geocode', ['$http', '$log', function GeocodeFactory($http, $log) {
    function degreesToRadians(degrees) {
      var radians = (degrees * Math.PI)/180;
      return radians;
    };
    return {
      computeDistance: function(startCoords, destCoords) {
        var startLatRads = degreesToRadians(startCoords.latitude),
            startLongRads = degreesToRadians(startCoords.longitude),
            destLatRads = degreesToRadians(destCoords.latitude),
            destLongRads = degreesToRadians(destCoords.longitude),
            radius = 3959,
            distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) + Math.cos(startLatRads) * Math.cos(destLatRads)
     * Math.cos(startLongRads - destLongRads)) * radius;
        return distance;
      },
      // Access the Google Geocoding API
      googleGeocode: function(address, successCallBack, errorCallBack) {
        var errorMsg;

        $http.get('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCqfFNFVyDEaoex6dH6y4AyjchN5214Vnc&address=' + address).
        success(function(data) {
          switch (data.status) {
            case 'OK':
              successCallBack(data);
              break;
            case 'ZERO_RESULTS':
              errorMsg = 'No results found. Please check the input query.';
              errorCallBack(errorMsg);
              break;
            case 'OVER_QUERY_LIMIT':
              errorMsg = 'Andeys.com has exceeded Google\'s query limit. Try again later.';
              errorCallBack(errorMsg);
              break;
            case 'REQUEST_DENIED':
              errorMsg = 'Request to contact Google Geocoding API denied. This is a configuration problem.';
              errorCallBack(errorMsg);
              break;
            case 'INVALID_REQUEST':
              errorMsg = 'Invalid request. Please check the input query.';
              errorCallBack(errorMsg);
              break;
            case 'UNKNOWN_ERROR':
              errorMsg = 'An unknown error occured. Try again later.';
              errorCallBack(errorMsg);
              break;
            default:
              errorMsg = 'An error occured.';
              errorCallBack(errorMsg);
          }
        }).
        error(function() {
          var errorMsg = 'Could not contact the Google API.';
          errorCallBack(errorMsg);
          $log.error('Failed to contact Google Geocoding API.');
        });
      }
    };
  }]);

})();