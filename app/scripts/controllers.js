'use strict';
angular.module('Prisoner.controllers', [])

.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
 
  // Called to navigate to the main app
  $scope.startApp = function() {
    $state.go('main');
  };
  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };
})
.controller('LeaderCtrl',function($scope,$state,loginService){
  $scope.users=loginService.getAll();
})
.controller('MainCtrl', function($scope, $state,user,GameService,$interval,loginService,$timeout) {  
  var Lobby;
  var unbindOpponent=function(){};
  $scope.opponentInfo={};
  var unbindLobbySpot=function(){};
  $scope.inGame=false;
  var limit=25;
  $scope.rules={limit:25};
  GameService.getRules().then(function(rules){
    if(typeof rules.limit!=='undefined'){
      $scope.rules=rules;
      limit=rules.limit;
    }
  });
  $scope.opponent={};
  var syncObject=loginService.getUser(user.uid);
  syncObject.$bindTo($scope, 'user');
  $scope.$watch('user',function(){
    if(typeof $scope.user!=='undefined'){
      if(typeof $scope.user.fullname==='undefined'||$scope.user.fullname===''){
        $scope.user.fullname='anonymous'+Math.floor((Math.random()*1000)+1);
        //$scope.user.$save();
      }
    }
  });

  $scope.resetGame=function(){
    console.log('game started');
    unbindOpponent();
    unbindOpponent=function(){};
    unbindLobbySpot();
    unbindLobbySpot=function(){};
    $scope.inGame=false;
    $scope.opponentInfo={};
    //Enter Lobby
    /*
    *
    *
    */
    GameService.enterLobby(user.uid).then(function(lobbySpot){
        lobbySpot.$bindTo($scope,'lobbySpot').then(function(unbind){
          unbindLobbySpot=unbind;
        });
        //$scope.choice=GameService.getChoice(user.uid);
      });

    // $scope.$watch('choice',function(newValue,oldValue){
       //console.log('choice changed',$scope.choice);
    // });
    GameService.getLobby().on('child_added',function(snapshot){
      if(!$scope.inGame){
        if(snapshot.val().opponent===''&&snapshot.key()!==user.uid&&snapshot.val().online){
          console.log('found empty',snapshot.val(),snapshot.key());
          $scope.inGame=true;
          GameService.updateOpponent(snapshot.key(),user.uid,function(){
            unbindOpponent();
            GameService.getOpponent(snapshot.key()).$bindTo($scope,'opponent').then(function(unbind){
              unbindOpponent=unbind;
            });
            GameService.getOpponentInfo(snapshot.key()).then(function(data){
              $scope.opponentInfo=data;
              console.log('opponentInfo',data);
            });
          });
        }
      }
    });
  };
  
  //Watch our own lobbyspot to see if anyone wants to join
  $scope.$watch('lobbySpot',function(newValue,oldValue){
    if(typeof newValue!=='undefined' && typeof oldValue!=='undefined'){
      if(typeof newValue.opponent!=='undefined' && newValue.opponent!==''){
        if(newValue.opponent!==oldValue.opponent && newValue.online && newValue.plays<limit){
          console.log('opponent has called us', newValue.opponent);
          $scope.inGame=true;
          GameService.updateOpponent(newValue.opponent,user.uid,function(){
            unbindOpponent();
            GameService.getOpponent(newValue.opponent).$bindTo($scope,'opponent').then(function(unbind){
              unbindOpponent=unbind;
            });
            GameService.getOpponentInfo(newValue.opponent).then(function(data){
              $scope.opponentInfo=data;
              console.log('opponentInfo',data);
            });
          });
        }
      }
    }
  });

  $scope.resetGame();
  // Lobby=GameService.getLobby();
  // Lobby.$watch(function(event){
  //   console.log(event);
  // });
  

  //watch for when both have selected
  $scope.$watch('opponent',function(newValue,oldValue){
    var playerChoice;
    var opponentChoice;

    if(typeof newValue!=='undefined'&&typeof oldValue !=='undefined'){
      if(typeof newValue.online==='undefined'&&oldValue.online){
        console.log('opponent offline');
        $scope.resetGame();
      }
      if(typeof newValue.opponent!=='undefined' && newValue.opponent!==user.uid && oldValue.opponent===user.uid){
        console.log('opponent switched');
        $scope.resetGame();
      }
    }

    if(typeof $scope.lobbySpot!=='undefined'&&$scope.lobbySpot!==null){
      playerChoice=$scope.lobbySpot.choice;
    }else{
      playerChoice='';
    }
    if(typeof newValue !=='undefined'){
      if(newValue.choice==='hawk'||newValue.choice==='dove'){
        if(playerChoice==='hawk'||playerChoice==='dove'){
          opponentChoice=newValue.choice;
          $scope.lobbySpot.choice='';

          $scope.opponentChoice=opponentChoice;
          $timeout(function(){$scope.opponentChoice=''},600);

          console.log('starting rule play opponent initiated',playerChoice,opponentChoice);
          GameService.performGameRules(playerChoice,opponentChoice,user.uid).then(function(points){
            console.log('performed games rules, resetting round');
            $scope.lobbySpot.points=$scope.lobbySpot.points+points;
            $scope.lobbySpot.plays++;


            if($scope.lobbySpot.plays>=limit){
              console.log('congrats plays limit, reset');
              $scope.message='congrats, round finished';
              $timeout(function(){$scope.message=''},2000);
              $scope.resetGame();
              GameService.addGameNumber(user.uid);
              GameService.transferPoints(user.uid,$scope.lobbySpot.points);
            }

          });
        }
      }
    }
  });

  $scope.performPlayerSide=function(playerChoice,opponentChoice){
    if(typeof playerChoice!=='undefined'){
      if(playerChoice==='hawk'||playerChoice==='dove'){
        if(opponentChoice==='hawk'||opponentChoice==='dove'){
          console.log('starting rule play I initiated',playerChoice,opponentChoice,$scope.lobbySpot);
          GameService.performGameRules(playerChoice,opponentChoice,user.uid).then(function(points){
            console.log('performed games rules, resetting round');
            $scope.lobbySpot.points=$scope.lobbySpot.points+points;
            $scope.lobbySpot.plays++;
            $scope.lobbySpot.choice='';


            if($scope.lobbySpot.plays>=limit){
              console.log('congrats plays limit, reset');
              $scope.message='congrats, round finished';
              $timeout(function(){$scope.message=''},2000);
              $scope.resetGame();
              GameService.addGameNumber(user.uid);
              GameService.transferPoints(user.uid,$scope.lobbySpot.points);
            }  

          });
        }
      }
    }
  };

  $scope.choose=function(choice){
    //$scope.choice=choice;
    $scope.lobbySpot.choice=choice;
    if(typeof $scope.opponent!=='undefined'){
      var opponentChoice=$scope.opponent.choice;
      if(opponentChoice==='hawk'||opponentChoice==='dove'){
        $scope.opponentChoice=opponentChoice;
        $timeout(function(){$scope.opponentChoice=''},600);
        $timeout(function(){$scope.performPlayerSide(choice,opponentChoice)},300);
      }
    }
  };
  $scope.toIntro = function(){
    $state.go('intro');
  };

});
