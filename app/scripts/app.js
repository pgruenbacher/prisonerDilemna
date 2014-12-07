'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
angular.module('Prisoner', [
  'ionic',
  'config',
  'firebase',
  'Prisoner.controllers',
  'Prisoner.services',
  'Prisoner.directives'
])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('intro', {
    url: '/',
    templateUrl: 'templates/intro.html',
    controller: 'IntroCtrl'
  })
  .state('board',{
    url:'/board',
    templateUrl:'templates/leaderBoard.html',
    controller:'LeaderCtrl'
  })
  .state('main', {
    url: '/main',
    templateUrl: 'templates/main.html',
    controller: 'MainCtrl',
    resolve:{
      user:function(loginService){
        var authData=loginService.getAuth();
        console.log(authData);
        if(!authData){
          return loginService.anonymous().then(function(user){
            console.log(user);
            return user;
          },function(error){
            console.log(error);
            return error;
          });
        }else{
          console.log(authData);
          return authData;
        }
      }
    }
  });

  $urlRouterProvider.otherwise('/board');

});
