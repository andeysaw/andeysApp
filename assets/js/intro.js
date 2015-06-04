(function() {
  'use strict';
  angular.module('AndeysApp').

  // Hero image manipulation
  directive('andeysMoveHero', function() {
    return {
      restrict: 'A',
      scope: false,
      link: function(scope, element, attributes) {
        var xMousePrev = null,
            yMousePrev = null;

        element.on("mousemove", function(event) {
          var xElement = parseFloat(element.css('right')),
              yElement = parseFloat(element.css('bottom')),
              xMouse = event.offsetX,
              yMouse = event.offsetY,
              xDelta,
              yDelta;

          if (!xMousePrev) {
            xMousePrev = xMouse;
          }
          if (!yMousePrev) {
            yMousePrev = yMouse;
          }

          xDelta = xMouse - xMousePrev;
          yDelta = yMouse - yMousePrev;

          if (xDelta > 0) {
            element.css('right', xElement - 0.2);          
          }
          if (xDelta < 0) {
            element.css('right', xElement + 0.2);          
          }
          if (yDelta > 0) {
            element.css('bottom', yElement - 0.2);          
          }
          if (yDelta < 0) {
            element.css('bottom', yElement + 0.2);          
          }

          xMousePrev = xMouse;
          yMousePrev = yMouse;
        });
      }
    };
  });

})();