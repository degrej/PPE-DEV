var commercial = angular.module('commercial_app', ['ngRoute', 'ngCookies', 'commercialControllers', 'commercialServices', 'authenticationServices']);

commercial.config(['$httpProvider', function($httpProvider){
  $httpProvider.interceptors.push('tokenInterceptor');
}]);

commercial.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $routeProvider
    .when('/', {
      templateUrl: '/angular/modules/commercial/partials/index.html', // partial qui est rendu
      controller: 'commercialCtrl',
      access: {authed: true} // peut avoir des contraintres 
    })
}]);

commercial.run(['$rootScope', '$location', '$window',function($rootScope, $location, $window){
  $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute){
    if(nextRoute.access == true && !$window.sessionStorage.token){
      $location.path('#/login');
    }
  })
}]);