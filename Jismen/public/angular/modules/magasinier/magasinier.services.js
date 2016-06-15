var magasinierServices = angular.module('magasinierServices', []);

/***********************
********* AUTH **********
**************************/

magasinierServices.factory('authFactory', function(){
  var auth = {
    islogged: false
  };
  return auth;
});

/***********************
****** INTERCEPTOR ******
**************************/

magasinierServices.factory('tokenInterceptor', ['$q', '$window', 'authFactory', function($q, $window, authFactory){
  return {
    request: function(config){
      config.headers = config.headers || {};
      if($window.sessionStorage.token){
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },

    requestError: function(rejection){
      return $q.reject(rejection);
    },

    response: function(response){
      if(response != null && response.status == 200 && $window.sessionStorage.token && !authFactory.isLogged){
        authFactory.isLogged = true;
      }
      return response || $q.when(response);
    },

    responseError: function(rejection){
      if(rejection != null && rejection.status == 401 && ($window.sessionStorage.token || authFactory.isLogged)){
        delete $window.sessionStorage.token;
        authFactory.isLogged = false;
        $location.path('#/login');
      }
      return $q(rejection);
    }
  };
}]);

/***********************
******** PRODUCTS *******
**************************/
magasinierServices.factory('productsFactory', ['$http', function($http){
  // On prépare le conteneur de nos fonctions de services
  var productFactoryObj = {};

  // On définit les propriétés et fonctions de notre service
  productFactoryObj.sizes = ['XS','S','M','L','XL','XXL'];
  productFactoryObj.shoes_sizes = ['36','37','38','39','40','41','42','43','44','45','46']; 
  productFactoryObj.getAllProducts = function(products,err) {
    return $http.get('/api/product/all');
  };
  productFactoryObj.getProduct = function(productId, callbackSuccessSelectProduct, callbackErrorSelectProduct) {
    var httpPromiseSelectProduct =  $http.get('/api/product/' + productId);
	
	if(callbackSuccessSelectProduct && typeof(callbackSuccessSelectProduct) === 'function') {
      httpPromise.success(callbackSuccessSelectProduct);
    }
    if(callbackErrorSelectProduct && typeof(callbackErrorSelectProduct) === 'function') {
      httpPromise.error(callbackErrorSelectProduct);
    }
    return httpPromiseSelectProduct;
  };
  productFactoryObj.addProduct = function(newProduct, callbackSuccessAdd, callbackErrorAdd) {
	  
    var httpPromiseAdd = $http.post('/admin/api/product', newProduct);
	
	if(callbackSuccessAdd && typeof(callbackSuccessAdd) === 'function') {
      httpPromiseAdd.success(callbackSuccessAdd);
    }
    if(callbackErrorAdd && typeof(callbackErrorAdd) === 'function') {
      httpPromiseAdd.error(callbackErrorAdd);
    }
    return httpPromiseAdd;
  };
  productFactoryObj.deleteProduct = function(productId, successCallback, errorCallback) {
    var httpPromise = $http.delete('/admin/api/product/' + productId);

    if(successCallback && typeof(successCallback) === 'function') {
      httpPromise.success(successCallback);
    }
    if(errorCallback && typeof(errorCallback) === 'function') {
      httpPromise.error(errorCallback);
    }
    return httpPromise;
  };  

  productFactoryObj.updateProduct = function(product, callbackSuccesUpdate, callbackErrorUpdate) {
    var httpPromiseUpdate = $http.put('/admin/api/product', {product:product});

    if (callbackSuccesUpdate && typeof(callbackSuccesUpdate) === 'function') {
      httpPromiseUpdate.success(callbackSuccesUpdate);
    }
    if(callbackErrorUpdate && typeof(callbackErrorUpdate) === 'function') {
      httpPromiseUpdate.error(callbackErrorUpdate);
    }
    return httpPromiseUpdate;
  };
    
  // On le rend accessible quand il est requis par un controlleur (DI: Dependency Injection)
  return productFactoryObj;
}]);

/***********************
******* CATEGORIES ******
**************************/
magasinierServices.factory('categoriesFactory', ['$http', function($http){
  return {
    getAllCategories: function(){
      return $http.get('/api/categorie/all');
    }
  }
}]);


/***********************
******* COLORS ******
**************************/
magasinierServices.factory('colorsFactory', ['$http', function($http){
  return {
    getAllColors: function(){
      return $http.get('/api/color/all');
    }
  }
}]);
