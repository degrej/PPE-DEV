var magasinier = angular.module('magasinier_app', ['ngRoute', 'ngCookies', 'magasinierControllers', 'magasinierServices', 'authenticationServices']);

magasinier.config(['$httpProvider', function($httpProvider){
  $httpProvider.interceptors.push('tokenInterceptor');
}]);

magasinier.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
  $routeProvider
    .when('/', {
      templateUrl: '/angular/modules/magasinier/partials/index.html', // partial qui est rendu
      controller: 'MagasinierCtrl',
      access: {authed: true} // peut avoir des contraintres 
    })
    .when('/products',{
      templateUrl: '/angular/modules/magasinier/partials/products.html',
      controller: 'MagasinierCtrl',
      access: {authed: true}
    })
    .when('/products/:product',{
      templateUrl: '/angular/modules/magasinier/partials/product.html',
      controller: 'MagasinierCtrl',
      access: {authed: true}
    })
    .when('/new/products/', {
      templateUrl: '/angular/modules/magasinier/partials/new_products.html',
      controller: 'MagasinierCtrl',
      access: {authed: true}
    })
    ;
}]);

magasinier.run(['$rootScope', '$location', '$window',function($rootScope, $location, $window){
  $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute){
    if(nextRoute.access == true && !$window.sessionStorage.token){
      $location.path('#/login');
    }
  })
}]);