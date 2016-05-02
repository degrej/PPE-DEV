var clientControllers = angular.module('clientControllers', []);


clientControllers.controller('userCtrl', ['$scope', '$routeParams', '$http',function($scope, $routeParams, $http){
  
}]);

clientControllers.controller('informationCtrl', ['$scope', '$routeParams', 'userFactory', 'AuthenticationService',function($scope, $routeParams, userFactory, authenticationService) {
	authenticationService.loadUserData();
	userFactory.information().success(function(responseInformationUser){
		var user= {};
		user.name = responseInformationUser.name;
		user.firstname = responseInformationUser.firstname;
		user.email = responseInformationUser.email;
		user.tel = responseInformationUser.tel;
		user.address = responseInformationUser.address;
		user.city = responseInformationUser.city;
		user.zipcode = responseInformationUser.zipcode;
		$scope.user = user;
	});
	$scope.update = function() {
		userFactory.updateProfil($scope.user).success(function(response)
		{
			alert("success");
		});
	};

}]);