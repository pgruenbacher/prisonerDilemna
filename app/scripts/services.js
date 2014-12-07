'use strict';
/*jshint unused: vars */
/* global Firebase*/
angular.module('Prisoner.services',[])
.factory('GameService', function($firebase,ENV,$q){
    var ref = new Firebase(ENV.apiEndpoint);
    var rules={};
    return{
        getRules:function(){
            var deferred=$q.defer();
            ref.child('rules').on('value',function(snapshot){
                rules=(snapshot.val());
                deferred.resolve(rules);
            });
            return deferred.promise;
        },
        enterLobby:function(uid){
            console.log('enteroing lobby',uid);
            var deferred=$q.defer();
            var amOnline = ref.child('.info/connected');
            var userRef = ref.child('lobby').child(uid);
            var lobby=ref.child('lobby');
            amOnline.on('value', function(snapshot) {
                if (snapshot.val()) {
                    userRef.onDisconnect().remove();
                }
            });
            // ref.child('lobby').child(uid).set({opponent:'',online:true,plays:'',timestamp:Firebase.ServerValue.TIMESTAMP},function(){
                
            //  deferred.resolve(sync.$asObject());
            // });
            ref.child('lobby').child(uid).transaction(function(currentData){
                return {
                    opponent:'',
                    online:true,
                    timestamp:Firebase.ServerValue.TIMESTAMP,
                    plays:0,
                    time:0,
                    choice:'',
                    points:0
                };
            },function(){
                var sync=$firebase(ref.child('lobby').child(uid));
                deferred.resolve(sync.$asObject());
            });         

            return deferred.promise;


        },
        updateOpponent:function(id,userId,callback){
            var deferred=$q.defer();
            console.log('update lobby',id,userId);
            ref.child('lobby').child(id).transaction(function(currentData){
                if(currentData!==null){
                    return {
                        opponent:userId,
                        online:true,
                        timestamp:Firebase.ServerValue.TIMESTAMP,
                        plays:0,
                        time:0,
                        choice:'',
                        points:0
                    };
                }
            },callback());
        },
        getLobby:function(id){
            return ref.child('lobby').orderByChild('timestamp');
        },
        getOpponent:function(id){
            var sync= $firebase(ref.child('lobby').child(id));
            return sync.$asObject();
        },
        getOpponentInfo:function(id){
            var deferred=$q.defer();
            ref.child('users').child(id).on('value',function(snapshot){
                deferred.resolve(snapshot.val());
            });
            return deferred.promise;
        },
        getChoice:function(id){
            var sync=$firebase(ref.child('lobby').child(id).child('choice'));
            return sync.$asObject();
        },
        addGameNumber:function(id){
            ref.child('users').child(id).child('games').transaction(function(count){
                console.log(count);
                if(count!=='undefined'&&count!==NaN){
                    count=count*1+1;
                }else{
                    count=0;
                }
                console.log(count);
                return count;
            });
        },
        performGameRules:function(player,opponent,id){
            var deferred=$q.defer();
            console.log('performGameRulesServiceCalled');
            var points=0;
            if(player==='hawk'&&opponent==='hawk'){
                points=rules.hawkHawk;
            }else if(player==='hawk'&&opponent==='dove'){
                points=rules.hawkDove;
            }else if(player==='dove'&&opponent==='hawk'){
                points=rules.doveHawk;
            }else if(player==='dove'&&opponent==='dove'){
                points=rules.doveDove;
            }
            deferred.resolve(points);
            // ref.child('lobby').child(id).child('points').transaction(function(count){
            //     console.log('performing game rules',player,opponent,id,'counts',count,points);
            //     return points+count;
            // },function(){
            //     deferred.resolve(points);
            // });
            return deferred.promise;
        },
        transferPoints:function(id,points){
            ref.child('users').child(id).child('points').transaction(function(count){
                return count+points;
            });
        }
    };
})
.factory('loginService',function($firebase,$firebaseAuth,ENV,$q){
    var ref = new Firebase(ENV.apiEndpoint);
    return{
        getAuth:function(){
            var authObj=$firebaseAuth(ref);
            return authObj.$getAuth();
        },
        getAll:function(){
            var sync=$firebase(ref.child('users'))
            return sync.$asArray();
        },
        facebook:function(){
            var deferred=$q.defer();
            var auth = $firebaseAuth(ref);
            auth.$authWithOAuthPopup('facebook').then(function(authData) {
              console.log('Logged in as:', authData.uid);
              ref.child('users').child(authData.uid).set(authData);
              deferred.resolve(authData);
            }).catch(function(error) {
              console.error('Authentication failed: ', error);
              deferred.reject(error);
            });
            return deferred.promise;
        },
        anonymous:function(){
            var self;
            var deferred=$q.defer();
            var auth = $firebaseAuth(ref);
            auth.$authAnonymously({remember:true}).then(function(authData) {
                console.log("Logged in as:", authData.uid);
                authData.games=0;
                authData.points=0;
                ref.child('users').child(authData.uid).set(authData);
                deferred.resolve(authData);
            }).catch(function(error) {
              console.error("Authentication failed:", error);
              deferred.reject(error);
            });
            return deferred.promise;
        },
        getUser:function(id){
            console.log(id);
            var sync=$firebase(ref.child('users').child(id));
            return sync.$asObject();
        }
    };
});