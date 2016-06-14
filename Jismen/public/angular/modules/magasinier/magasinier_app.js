var magasinier = angular.module('magasinier_app', ['ngRoute', 'ngCookies', 'magasinierControllers', 'magasinierServices', 'authenticationServices']);

magasinier.config(['$httpProvider', function($httpProvider){
  //$httpProvider.interceptors.push('tokenInterceptor');
}]);

magasinier.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $routeProvider
    .when('/', {
      templateUrl: '/angular/modules/magasinier/partials/index.html', // partial qui est rendu
      controller: 'MagasinierCtrl',
      access: {authed: true} // peut avoir des contraintres 
    })
}]);

magasinier.run(['$rootScope', '$location', '$window',function($rootScope, $location, $window){
  $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute){
    if(nextRoute.access == true && !$window.sessionStorage.token){
      $location.path('#/login');
    }
  })
}]);