(function() {
  'use strict';
  angular.module('AndeysApp').

  // Controller for individual trip page
  controller('TripController', ['$routeParams', '$location', '$q', '$filter', '$modal', 'Database', function($routeParams, $location, $q, $filter, $modal, Database) {
    var TripCtrl = this;

    // Will hold range of dates for a travelog
    TripCtrl.dateArray = new Array();
    // Date of a particular day of a trip
    TripCtrl.tripDate = $routeParams.tripDate;
    // Base url path for navigation between trip days
    var urlPath = $location.path().substr(0, $location.path().lastIndexOf('/') + 1);
    // Used to defer action until travel pics data loaded
    var deferTravelPics = $q.defer();

    // Update trip day when new date picked from selector
    // arg newDate = date selected from form
    TripCtrl.updatePath = function(newDate) {
      $location.path(urlPath + newDate);
    };

    // Get all travelog data
    Database.getData('travelogs', function(data) {
      var entries = data;

      // Create a range of dates of every travelog
      for (var i = 0; i < entries.length; i++) {
        var startDate = entries[i].startDate,
            days = entries[i].days,
            dateArray = [startDate],
            dateObj = new Date(startDate.substring(0,4),startDate.substring(5,7)-1,startDate.substring(8,11)),
            dateIndex;

        for (var j = 1; j < days; j++) {
          dateObj.setDate(dateObj.getDate() + 1);
          dateArray.push($filter('date')(dateObj, 'yyyy-MM-dd'));
        }

        // Check to see if the current trip date is within this range of dates
        dateIndex = dateArray.indexOf(TripCtrl.tripDate);

        // If date is within range, this trip date belongs to this travelog
        if (dateIndex !== -1) {
          TripCtrl.tripName = entries[i].title;
          TripCtrl.dateArray = dateArray;
          TripCtrl.dayOfTrip = dateIndex + 1;
          break;
        }
      }
    });

    // Get travel pic data for one trip day
    Database.getData('travelpics', function(data) {
      var entries = data;
      deferTravelPics.resolve(entries);
    }, TripCtrl.tripDate);

    // Access data in scope when promise fulfilled
    TripCtrl.promiseTravelPics = deferTravelPics.promise;

    // Prevent invalid day before
    TripCtrl.noPrevDay = function() {
      return (TripCtrl.tripDate === TripCtrl.dateArray[0]);
    };

    // Prevent invalid day after
    TripCtrl.noNextDay = function() {
      return (TripCtrl.tripDate === TripCtrl.dateArray[TripCtrl.dateArray.length - 1]);
    };

    // Go to previous day
    TripCtrl.goPrevDay = function() {
      if (TripCtrl.tripDate !== TripCtrl.dateArray[0]) {
        $location.path(urlPath + TripCtrl.dateArray[TripCtrl.dateArray.indexOf(TripCtrl.tripDate) - 1]);
      }
    };

    // Go to next day
    TripCtrl.goNextDay = function() {
      if (TripCtrl.tripDate !== TripCtrl.dateArray[TripCtrl.dateArray.length - 1]) {
        $location.path(urlPath + TripCtrl.dateArray[TripCtrl.dateArray.indexOf(TripCtrl.tripDate) + 1]);
      }
    };

    // Create a modal for a photo and assign it a controller
    TripCtrl.openPhotoModal = function (entry) {
      var modalInstance = $modal.open({
        template: '<h4 class="text-center" data-ng-bind-html="ModalTravelogPhotoCtrl.name"></h4><figure class="modal text-center"><img data-ng-src="{{ModalTravelogPhotoCtrl.filepath}}"><figcaption data-ng-bind-html="ModalTravelogPhotoCtrl.description"></figcaption></figure><a class="close-reveal-modal" data-ng-click="ModalTravelogPhotoCtrl.close()">&#215;</a>',
        controller: 'ModalTravelogPhotoController',
        controllerAs: 'ModalTravelogPhotoCtrl',
        resolve: {
          entry: function () {
            return entry;
          }
        }
      });
    };
  }]).

  // Controller for travelog photo modals
  controller('ModalTravelogPhotoController', ['$modalInstance', 'entry', function ($modalInstance, entry) {
    var ModalTravelogPhotoCtrl = this;
    ModalTravelogPhotoCtrl.name = entry.title;
    ModalTravelogPhotoCtrl.description = entry.description;
    ModalTravelogPhotoCtrl.filepath = '/assets/images/travelogs/' + entry.date.substr(0,4) + '/' + entry.date.substr(5,2) + '/' + entry.filename + '.jpg';

    ModalTravelogPhotoCtrl.close = function () {
      $modalInstance.dismiss('close');
    };
  }]).

  // Outputs individual trip log
  directive('andeysTripLog', ['$http', '$templateCache', '$compile', function($http, $templateCache, $compile) {
    return {
      restrict: 'E',
      replace: true,
      link: function(scope, element, attribute) {
        scope.$watch('TripCtrl.tripDate', function(value) {
          $http.get('templates/logs/' + attribute.date + '.html', {cache: $templateCache})
          .success(function(data) {
            var compileFunc = $compile(data),
              content = compileFunc(scope);
            element.html(content);
          })
          .error(function() {
              element.html('<div data-alert class="alert-box alert">There was an error retrieving the template.</div>');
          });
        });
      }
    };
  }]).

  // Outputs individual picture in trip log
  directive('andeysTripPic', function() {
    return {
      restrict: 'E',
      scope: true,
      replace: true,
      link: function(scope, element, attribute) {
        scope.TripCtrl.promiseTravelPics.then(function(data) {
          var tripPic;
          for (var i = 0; i < data.length; i++) {
            if (data[i].filename === attribute.tripPic) {
              tripPic = data[i];
              scope.path = '/assets/images/travelogs/' + tripPic.date.substr(0,4) + '/' + tripPic.date.substr(5,2) + '/' + tripPic.filename;
              scope.description = tripPic.description;
              scope.title = tripPic.title;
              scope.entry = tripPic;
              break;
            }
          }
        });
      },
      template: '<figure><a data-ng-click="TripCtrl.openPhotoModal(entry)" class="th"><img aria-hidden=true data-ng-src="{{path}}-th.jpg"></a><figcaption data-ng-bind-html="title"></figcaption></figure>'
    };
  });

})();