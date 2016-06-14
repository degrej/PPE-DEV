var magasinierControllers = angular.module('magasinierControllers', []);

magasinierControllers.controller('MagasinierCtrl', [
  '$scope', '$http', '$window', '$location', 'AuthenticationService',
  function($scope, $http, $window, $location, authenticationService){

  	 authenticationService.loadUserData(); //permet de retourner le token
  }]);