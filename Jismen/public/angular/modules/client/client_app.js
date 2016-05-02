var client = angular.module('client_app', ['ngRoute', 'ngCookies', 'ui.bootstrap', 'clientControllers', 'clientServices', 'authenticationServices']);

client.config(['$routeProvider', function($routeProvider){
	$routeProvider
		// USER
		.when('/user', {
			templateUrl: '/angular/modules/client/partials/user.html',
			controller: 'userCtrl'
		})
		.when('/user/information', {
			templateUrl: '/angular/modules/client/partials/user.html',
			controller: 'informationCtrl'
		})
}]);
