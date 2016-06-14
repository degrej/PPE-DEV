var commercialControllers = angular.module('commercialControllers', []);

commercialControllers.controller('commercialCtrl', [
  '$scope', '$http', '$window', '$location', 'AuthenticationService',
  function($scope, $http, $window, $location, authenticationService){

  	 authenticationService.loadUserData(); //permet de retourner le token
  }]);