'use strict';
/*jshint unused: vars*/
angular.module('Prisoner.directives',[])
.directive('sliding', function ($interval) {
    return {
      scope:{
        backgroundClass:'@'
      },
      template: '<div class="sliding-background {{backgroundClass}}"><div ng-transclude></div></div>',
      restrict: 'A',
      transclude:true,
      link: function postLink(scope, element, attrs) {
        var speed = 80;
        var pos = 0;
        var child=element.children(1);
        function bgScroll(){
          pos += 1;
          child.css({backgroundPosition: pos + 'px '+0+'px'});
        }
        // start the UI update process; save the timeoutId for canceling
        var timeoutId = $interval(function() {
          bgScroll(); // update DOM
        }, speed);
        element.on('$destroy', function() {
          $interval.cancel(timeoutId);
        });
      }
    };
  });