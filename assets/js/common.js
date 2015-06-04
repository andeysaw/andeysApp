(function() {
  'use strict';
  // Angular Services
  angular.module('AndeysApp').

  // Get data from databases
  factory('Database', ['$http', '$log', function DataFactory($http, $log) {
    return {
      getData: function(database, successCallBack, dateFilter) {
        var uri = '/assets/data/api.php/' + database;
        if (dateFilter) {
          uri += '/' + dateFilter;
        }
        $http.get(uri, {cache:true}).
        success(function(data) {
          successCallBack(data);
        }).
        error(function() {
          $log.error('Retrieving ' + database + ' data failed.');
        });
      }
    };
  }]);
})();