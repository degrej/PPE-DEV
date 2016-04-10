var client = angular.module('client_app', ['ngRoute', 'ngCookies', 'ui.bootstrap', 'clientControllers', 'clientServices', 'authenticationServices']);

client.config(['$routeProvider', function($routeProvider){
	$routeProvider
		// USER
		/*.when('/user/:id', {
			templateUrl: 'angular/modules/homepage/partials/user.html',
			controller: 'UserCtrl'
		})*/
		.when('/user', {
			templateUrl: '/angular/modules/client/partials/user.html',
			controller: 'userCtrl'
		})
}]);
